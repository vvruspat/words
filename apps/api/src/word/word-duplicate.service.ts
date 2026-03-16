import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Repository } from "typeorm";
import { In } from "typeorm";
import {
	WORD_DUPLICATE_GROUP_REPOSITORY,
	WORD_REPOSITORY,
	WORD_SYNONYM_GROUP_REPOSITORY,
} from "../constants/database.constants";
import {
	DEFAULT_VECTOR_SIMILARITY_THRESHOLD,
	SYNONYM_SIMILARITY_THRESHOLD,
} from "./word.constants";
import type { WordEntity } from "./word.entity";
import { WordDuplicateGroupEntity } from "./word-duplicate-group.entity";
import { WordSynonymGroupEntity } from "./word-synonym-group.entity";

@Injectable()
export class WordDuplicateService {
	private readonly logger = new Logger(WordDuplicateService.name);

	constructor(
		@Inject(WORD_DUPLICATE_GROUP_REPOSITORY)
		private readonly groupRepository: Repository<WordDuplicateGroupEntity>,
		@Inject(WORD_SYNONYM_GROUP_REPOSITORY)
		private readonly synonymGroupRepository: Repository<WordSynonymGroupEntity>,
		@Inject(WORD_REPOSITORY)
		private readonly wordRepository: Repository<WordEntity>,
	) {}

	/**
	 * Runs every hour to recompute all duplicate groups from scratch.
	 */
	@Cron(CronExpression.EVERY_HOUR)
	async recalculateGroups(): Promise<void> {
		this.logger.log("Starting duplicate group recalculation...");

		const pairs = await this.wordRepository.manager.query<
			Array<{ id1: number; id2: number; lang: string }>
		>(
			`SELECT w1.id AS id1, w2.id AS id2, w1.language AS lang
			 FROM word w1
			 JOIN word w2 ON w1.id < w2.id AND w1.language = w2.language
			 WHERE w1.embedding IS NOT NULL
			   AND w2.embedding IS NOT NULL
			   AND (1 - (w1.embedding::vector(1536) <=> w2.embedding::vector(1536))) >= $1`,
			[DEFAULT_VECTOR_SIMILARITY_THRESHOLD],
		);

		if (pairs.length === 0) {
			await this.groupRepository.clear();
			this.logger.log("No duplicate pairs found, cleared all groups.");
			return;
		}

		// Union-Find to cluster transitive pairs
		const parent = new Map<number, number>();
		const langMap = new Map<number, string>();

		const find = (x: number): number => {
			if (!parent.has(x)) parent.set(x, x);
			const p = parent.get(x) ?? x;
			if (p !== x) parent.set(x, find(p));
			return parent.get(x) ?? x;
		};

		for (const { id1, id2, lang } of pairs) {
			const r1 = find(id1);
			const r2 = find(id2);
			if (r1 !== r2) parent.set(r1, r2);
			langMap.set(id1, lang);
			langMap.set(id2, lang);
		}

		// Build clusters: root → member IDs
		const clusters = new Map<number, { ids: number[]; lang: string }>();
		for (const id of langMap.keys()) {
			const root = find(id);
			const lang = langMap.get(id) ?? "";
			const entry = clusters.get(root) ?? { ids: [], lang };
			entry.ids.push(id);
			clusters.set(root, entry);
		}

		// Only keep groups with 2+ members
		const newGroups = Array.from(clusters.values()).filter(
			(c) => c.ids.length > 1,
		);

		// Replace all groups atomically
		await this.groupRepository.manager.transaction(async (manager) => {
			await manager.clear(WordDuplicateGroupEntity);
			for (const { ids, lang } of newGroups) {
				const group = manager.create(WordDuplicateGroupEntity, {
					language: lang,
					word_ids: ids,
				});
				await manager.save(group);
			}
		});

		this.logger.log(
			`Duplicate recalculation complete: ${newGroups.length} groups saved.`,
		);
	}

	/**
	 * Returns duplicate group count per language from the pre-computed table.
	 */
	async getDuplicateStatsByLanguage(): Promise<
		Array<{ language: string; count: number }>
	> {
		const rows = await this.groupRepository
			.createQueryBuilder("g")
			.select("g.language", "language")
			.addSelect("COUNT(g.id)", "count")
			.groupBy("g.language")
			.getRawMany<{ language: string; count: string }>();

		return rows.map(({ language, count }) => ({
			language,
			count: Number(count),
		}));
	}

	/**
	 * Returns paginated duplicate groups with full word data.
	 */
	async findDuplicates(
		limit: number,
		offset: number,
		language?: string,
	): Promise<{
		groups: { word: string; language: string; items: WordEntity[] }[];
		total: number;
	}> {
		const where = language ? { language } : {};
		const [allGroups, total] = await this.groupRepository.findAndCount({
			where,
			order: { id: "ASC" },
			skip: offset,
			take: limit,
		});

		const groups = await Promise.all(
			allGroups.map(async (group) => {
				const items = await this.wordRepository
					.createQueryBuilder("w")
					.leftJoinAndSelect("w.topicData", "topic")
					.leftJoinAndSelect("w.catalogData", "catalog")
					.where("w.id IN (:...ids)", { ids: group.word_ids })
					.orderBy("w.created_at", "ASC")
					.getMany();
				return {
					word: items[0]?.word ?? "",
					language: group.language,
					items,
				};
			}),
		);

		return { groups, total };
	}

	/**
	 * Runs every hour to recompute synonym groups (threshold 0.90) for client-side validation.
	 * Separate from duplicate groups (0.97) which are used for admin deduplication.
	 */
	@Cron(CronExpression.EVERY_HOUR)
	async recalculateSynonymGroups(): Promise<void> {
		this.logger.log("Starting synonym group recalculation...");

		const pairs = await this.wordRepository.manager.query<
			Array<{ id1: number; id2: number; lang: string }>
		>(
			`SELECT w1.id AS id1, w2.id AS id2, w1.language AS lang
			 FROM word w1
			 JOIN word w2 ON w1.id < w2.id AND w1.language = w2.language
			 WHERE w1.embedding IS NOT NULL
			   AND w2.embedding IS NOT NULL
			   AND (1 - (w1.embedding::vector(1536) <=> w2.embedding::vector(1536))) >= $1`,
			[SYNONYM_SIMILARITY_THRESHOLD],
		);

		if (pairs.length === 0) {
			await this.synonymGroupRepository.clear();
			this.logger.log("No synonym pairs found, cleared all synonym groups.");
			return;
		}

		const parent = new Map<number, number>();
		const langMap = new Map<number, string>();

		const find = (x: number): number => {
			if (!parent.has(x)) parent.set(x, x);
			const p = parent.get(x) ?? x;
			if (p !== x) parent.set(x, find(p));
			return parent.get(x) ?? x;
		};

		for (const { id1, id2, lang } of pairs) {
			const r1 = find(id1);
			const r2 = find(id2);
			if (r1 !== r2) parent.set(r1, r2);
			langMap.set(id1, lang);
			langMap.set(id2, lang);
		}

		const clusters = new Map<number, { ids: number[]; lang: string }>();
		for (const id of langMap.keys()) {
			const root = find(id);
			const lang = langMap.get(id) ?? "";
			const entry = clusters.get(root) ?? { ids: [], lang };
			entry.ids.push(id);
			clusters.set(root, entry);
		}

		const newGroups = Array.from(clusters.values()).filter(
			(c) => c.ids.length > 1,
		);

		await this.synonymGroupRepository.manager.transaction(async (manager) => {
			await manager.clear(WordSynonymGroupEntity);
			for (const { ids, lang } of newGroups) {
				const group = manager.create(WordSynonymGroupEntity, {
					language: lang,
					word_ids: ids,
				});
				await manager.save(group);
			}
		});

		this.logger.log(
			`Synonym recalculation complete: ${newGroups.length} groups saved.`,
		);
	}

	/**
	 * Returns all synonym groups, optionally filtered by language.
	 * Used by mobile client to validate training answers.
	 */
	async findSynonymGroups(
		language?: string,
	): Promise<WordSynonymGroupEntity[]> {
		const where = language ? { language } : {};
		return this.synonymGroupRepository.find({ where });
	}

	/**
	 * After word deletion: remove groups that no longer have ≥ 2 surviving words.
	 */
	async cleanupGroupsForRemovedWords(removedIds: number[]): Promise<void> {
		if (removedIds.length === 0) return;

		// Find groups that contain any of the removed word IDs
		const affectedGroups = await this.groupRepository
			.createQueryBuilder("g")
			.where("g.word_ids && :ids", { ids: removedIds })
			.getMany();

		if (affectedGroups.length === 0) return;

		// Get IDs of words that still exist
		const candidateIds = [
			...new Set(affectedGroups.flatMap((g) => g.word_ids)),
		].filter((id) => !removedIds.includes(id));

		const survivingWords =
			candidateIds.length > 0
				? await this.wordRepository.find({
						where: { id: In(candidateIds) },
						select: ["id"],
					})
				: [];

		const survivingIds = new Set(survivingWords.map((w) => w.id));

		const toDelete: number[] = [];
		const toUpdate: WordDuplicateGroupEntity[] = [];

		for (const group of affectedGroups) {
			const remaining = group.word_ids.filter((id) => survivingIds.has(id));
			if (remaining.length < 2) {
				toDelete.push(group.id);
			} else {
				group.word_ids = remaining;
				toUpdate.push(group);
			}
		}

		await this.groupRepository.manager.transaction(async (manager) => {
			if (toDelete.length > 0) {
				await manager.delete(WordDuplicateGroupEntity, { id: In(toDelete) });
			}
			for (const group of toUpdate) {
				await manager.save(WordDuplicateGroupEntity, group);
			}
		});

		this.logger.log(
			`Cleanup: deleted ${toDelete.length} groups, updated ${toUpdate.length} groups after removing words [${removedIds.join(", ")}].`,
		);
	}
}
