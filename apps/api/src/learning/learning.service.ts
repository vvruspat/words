import { Inject, Injectable } from "@nestjs/common";
import type { Learning, LearningData } from "@vvruspat/words-types";
import type { Repository } from "typeorm";
import type { GetLearningRequestDto } from "~/dto";
import { LEARNING_REPOSITORY } from "../constants/database.constants";
import type { LearningEntity } from "./learning.entity";

export type UserProgressRequest = {
	userId: number;
	language?: string;
	limit?: number;
	offset?: number;
};

export type UserProgressSummary = {
	total: number;
	known: number;
	learning: number;
	weak: number;
	needsReview: number;
	averageScore: number | null;
};

@Injectable()
export class LearningService {
	constructor(
		@Inject(LEARNING_REPOSITORY)
		private learningRepository: Repository<LearningEntity>,
	) {}

	async findAll(query: GetLearningRequestDto): Promise<LearningData[]> {
		const { limit, offset, ...rest } = query;

		return this.learningRepository.find({
			where: { ...rest },
			relations: ["wordData", "translationData"],
			take: limit || 10,
			skip: offset || 0,
		});
	}

	async findOne(id: Learning["id"]): Promise<LearningData | null> {
		return this.learningRepository.findOne({
			where: { id },
			relations: ["wordData", "translationData"],
		});
	}

	async findUserProgress({
		userId,
		language,
		limit = 50,
		offset = 0,
	}: UserProgressRequest): Promise<{
		items: LearningData[];
		total: number;
		limit: number;
		offset: number;
		summary: UserProgressSummary;
		byTopic: Array<{
			topicId: number | null;
			topicTitle: string | null;
			total: number;
			averageScore: number | null;
		}>;
		byCatalog: Array<{
			catalogId: number | null;
			catalogTitle: string | null;
			total: number;
			averageScore: number | null;
		}>;
	}> {
		const itemsQuery = this.learningRepository
			.createQueryBuilder("learning")
			.leftJoinAndSelect("learning.wordData", "word")
			.leftJoinAndSelect("learning.translationData", "translation")
			.leftJoinAndSelect("word.topicData", "topic")
			.leftJoinAndSelect("word.catalogData", "catalog")
			.where("learning.user = :userId", { userId });

		if (language) {
			itemsQuery.andWhere("word.language = :language", { language });
		}

		const total = await itemsQuery.getCount();
		const items = await itemsQuery
			.orderBy("learning.last_review", "DESC")
			.skip(offset)
			.take(limit)
			.getMany();

		const summaryQuery = this.learningRepository
			.createQueryBuilder("learning")
			.innerJoin("learning.wordData", "word")
			.where("learning.user = :userId", { userId });

		if (language) {
			summaryQuery.andWhere("word.language = :language", { language });
		}

		const summaryRow = await summaryQuery
			.select("COUNT(*)", "total")
			.addSelect("COUNT(*) FILTER (WHERE learning.score >= 80)", "known")
			.addSelect(
				"COUNT(*) FILTER (WHERE learning.score >= 40 AND learning.score < 80)",
				"learning",
			)
			.addSelect("COUNT(*) FILTER (WHERE learning.score < 40)", "weak")
			.addSelect(
				"COUNT(*) FILTER (WHERE learning.last_review < NOW() - INTERVAL '1 day')",
				"needsReview",
			)
			.addSelect("AVG(learning.score)", "averageScore")
			.getRawOne<{
				total: string;
				known: string;
				learning: string;
				weak: string;
				needsReview: string;
				averageScore: string | null;
			}>();

		const topicQuery = this.learningRepository
			.createQueryBuilder("learning")
			.innerJoin("learning.wordData", "word")
			.leftJoin("word.topicData", "topic")
			.where("learning.user = :userId", { userId });

		if (language) {
			topicQuery.andWhere("word.language = :language", { language });
		}

		const topicRows = await topicQuery
			.select("word.topic", "topicId")
			.addSelect("topic.title", "topicTitle")
			.addSelect("COUNT(*)", "total")
			.addSelect("AVG(learning.score)", "averageScore")
			.groupBy("word.topic")
			.addGroupBy("topic.title")
			.orderBy("total", "DESC")
			.getRawMany<{
				topicId: string | null;
				topicTitle: string | null;
				total: string;
				averageScore: string | null;
			}>();

		const catalogQuery = this.learningRepository
			.createQueryBuilder("learning")
			.innerJoin("learning.wordData", "word")
			.leftJoin("word.catalogData", "catalog")
			.where("learning.user = :userId", { userId });

		if (language) {
			catalogQuery.andWhere("word.language = :language", { language });
		}

		const catalogRows = await catalogQuery
			.select("word.catalog", "catalogId")
			.addSelect("catalog.title", "catalogTitle")
			.addSelect("COUNT(*)", "total")
			.addSelect("AVG(learning.score)", "averageScore")
			.groupBy("word.catalog")
			.addGroupBy("catalog.title")
			.orderBy("total", "DESC")
			.getRawMany<{
				catalogId: string | null;
				catalogTitle: string | null;
				total: string;
				averageScore: string | null;
			}>();

		return {
			items,
			total,
			limit,
			offset,
			summary: {
				total: Number(summaryRow?.total ?? 0),
				known: Number(summaryRow?.known ?? 0),
				learning: Number(summaryRow?.learning ?? 0),
				weak: Number(summaryRow?.weak ?? 0),
				needsReview: Number(summaryRow?.needsReview ?? 0),
				averageScore:
					summaryRow?.averageScore != null
						? Number(summaryRow.averageScore)
						: null,
			},
			byTopic: topicRows.map((row) => ({
				topicId: row.topicId != null ? Number(row.topicId) : null,
				topicTitle: row.topicTitle,
				total: Number(row.total),
				averageScore:
					row.averageScore != null ? Number(row.averageScore) : null,
			})),
			byCatalog: catalogRows.map((row) => ({
				catalogId: row.catalogId != null ? Number(row.catalogId) : null,
				catalogTitle: row.catalogTitle,
				total: Number(row.total),
				averageScore:
					row.averageScore != null ? Number(row.averageScore) : null,
			})),
		};
	}

	async create(learning: Omit<Learning, "id">): Promise<Learning> {
		const newLearning = this.learningRepository.create(learning);
		return this.learningRepository.save(newLearning);
	}

	async ensureTrainingProgress({
		userId,
		wordId,
		translationId,
		training,
		score,
		overwrite = true,
	}: {
		userId: number;
		wordId: number;
		translationId: number;
		training: string;
		score: number;
		overwrite?: boolean;
	}): Promise<LearningEntity> {
		const now = new Date().toISOString();
		const existing = await this.learningRepository.findOne({
			where: {
				user: userId,
				word: wordId,
				translation: translationId,
				training,
			},
			order: { last_review: "DESC" },
		});

		if (existing) {
			if (overwrite) existing.score = score;
			existing.last_review = now;
			return this.learningRepository.save(existing);
		}

		return this.learningRepository.save(
			this.learningRepository.create({
				created_at: now,
				user: userId,
				word: wordId,
				score,
				last_review: now,
				training,
				translation: translationId,
			}),
		);
	}

	async addWordFromDialogue({
		userId,
		wordId,
		translationId,
		resetWriting = false,
	}: {
		userId: number;
		wordId: number;
		translationId: number;
		resetWriting?: boolean;
	}) {
		const intro = await this.ensureTrainingProgress({
			userId,
			wordId,
			translationId,
			training: "intro",
			score: 1,
			overwrite: false,
		});

		const writing = resetWriting
			? await this.ensureTrainingProgress({
					userId,
					wordId,
					translationId,
					training: "type_word",
					score: 0,
				})
			: null;
		return { intro, writing };
	}

	async update(
		learning: Omit<Partial<Learning>, "created_at">,
	): Promise<Learning | null> {
		await this.learningRepository.update({ id: learning.id }, learning);
		return this.findOne(learning.id);
	}

	async remove(id: Learning["id"]): Promise<void> {
		await this.learningRepository.delete({ id });
	}

	async removeByUserWord(userId: number, wordId: number): Promise<void> {
		await this.learningRepository.delete({ user: userId, word: wordId });
	}
}
