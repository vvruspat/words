import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ApiPaginatedResponse, Language } from "@vvruspat/words-types";
import type { Queue } from "bullmq";
import type { Repository } from "typeorm";
import { In, Like } from "typeorm";
import {
	AUDIO_CREATION_START,
	TRANSLATION_START,
	WORDS_GENERATION_START,
} from "~/constants/queue-events.constants";
import { OPENAI_QUEUE, TRANSLATIONS_QUEUE } from "~/constants/queues.constants";
import type { GetWordRequestDto } from "~/dto";
import { GcsService } from "~/gcs/gcs.service";
import { VocabCatalogService } from "~/vocabcatalog/vocabcatalog.service";
import { WordTranslationService } from "~/wordstranslation/wordstranslation.service";
import { WORD_REPOSITORY } from "../constants/database.constants";
import { TopicService } from "../topic/topic.service";
import type { GeneratedWord } from "./types/generated-word";
import type { WordEntity } from "./word.entity";
import { WordEventService } from "./word-event.service";

export type WordStatus = "pending" | "processing" | "processed";

@Injectable()
export class WordService {
	private readonly logger = new Logger(WordService.name);

	constructor(
		@Inject(WORD_REPOSITORY)
		private wordRepository: Repository<WordEntity>,
		private readonly topicService: TopicService,
		private readonly vocabCatalogService: VocabCatalogService,
		private readonly gcsService: GcsService,
		@InjectQueue(TRANSLATIONS_QUEUE) private translationQueue: Queue,
		@InjectQueue(OPENAI_QUEUE) private openAIQueue: Queue,
		private readonly wordEventService: WordEventService,
		private readonly wordTranslationService: WordTranslationService,
	) {}

	async findAll(
		query: GetWordRequestDto,
	): Promise<ApiPaginatedResponse<WordEntity>> {
		const {
			limit,
			offset,
			sortBy,
			sortOrder,
			word,
			translation,
			...restQuery
		} = query;

		// Build the base where clause
		const where: Record<string, unknown> = { ...restQuery };

		if (word) {
			where.word = Like(`%${word}%`);
		}

		// If searching by translation, resolve matching word IDs first
		if (translation) {
			const wordIds =
				await this.wordTranslationService.findWordIdsByTranslationSearch(
					translation,
				);
			where.id = wordIds.length > 0 ? In(wordIds) : In([-1]);
		}

		const total = await this.wordRepository.count({ where });

		const words = await this.wordRepository.find({
			where,
			take: limit ?? 10,
			skip: offset ?? 0,
			order: {
				[sortBy ?? "created_at"]: sortOrder ?? "DESC",
			},
		});

		return {
			items: words,
			total,
			limit: limit ?? 10,
			offset: offset ?? 0,
		};
	}

	async findOne(id: WordEntity["id"]): Promise<WordEntity | null> {
		return this.wordRepository.findOneBy({ id });
	}

	async findWordStats(): Promise<{
		wordsByLanguageCatalog: Array<{
			language: string;
			catalogId: number | null;
			catalogTitle: string | null;
			count: number;
		}>;
		duplicatesByLanguage: Array<{ language: string; count: number }>;
	}> {
		const wordRows = await this.wordRepository.manager.query<
			Array<{
				language: string;
				catalogId: string | null;
				catalogTitle: string | null;
				count: string;
			}>
		>(`
			SELECT w.language, w.catalog AS "catalogId", vc.title AS "catalogTitle", COUNT(*) AS count
			FROM word w
			LEFT JOIN vocab_catalogs vc ON vc.id = w.catalog
			GROUP BY w.language, w.catalog, vc.title
			ORDER BY w.language ASC, vc.title ASC
		`);

		const dupRows = await this.wordRepository.manager.query<
			Array<{ language: string; count: string }>
		>(`
			SELECT language, COUNT(*) AS count
			FROM (
				SELECT language, LOWER(word) AS word_key
				FROM word
				GROUP BY language, LOWER(word)
				HAVING COUNT(*) > 1
			) subq
			GROUP BY language
			ORDER BY language ASC
		`);

		return {
			wordsByLanguageCatalog: wordRows.map((r) => ({
				language: r.language,
				catalogId: r.catalogId != null ? Number(r.catalogId) : null,
				catalogTitle: r.catalogTitle,
				count: Number(r.count),
			})),
			duplicatesByLanguage: dupRows.map((r) => ({
				language: r.language,
				count: Number(r.count),
			})),
		};
	}

	async findDuplicates(
		limit: number,
		offset: number,
		language?: string,
	): Promise<{
		groups: { word: string; language: string; items: WordEntity[] }[];
		total: number;
	}> {
		const qb = this.wordRepository
			.createQueryBuilder("w")
			.select("LOWER(w.word)", "wordKey")
			.addSelect("w.language", "lang")
			.addSelect("COUNT(*)", "cnt")
			.groupBy("LOWER(w.word), w.language")
			.having("COUNT(*) > 1")
			.orderBy("cnt", "DESC")
			.addOrderBy("LOWER(w.word)", "ASC");

		if (language) {
			qb.where("w.language = :language", { language });
		}

		const allGroups = await qb.getRawMany<{
			wordKey: string;
			lang: string;
			cnt: string;
		}>();

		const total = allGroups.length;
		const paginatedGroups = allGroups.slice(offset, offset + limit);

		const groups = await Promise.all(
			paginatedGroups.map(async ({ wordKey, lang }) => {
				const items = await this.wordRepository
					.createQueryBuilder("w")
					.leftJoinAndSelect("w.topicData", "topic")
					.leftJoinAndSelect("w.catalogData", "catalog")
					.where("LOWER(w.word) = :wordKey", { wordKey })
					.andWhere("w.language = :lang", { lang })
					.orderBy("w.created_at", "ASC")
					.getMany();
				return { word: wordKey, language: lang, items };
			}),
		);

		return { groups, total };
	}

	async create(word: Omit<WordEntity, "id">): Promise<WordEntity> {
		const newWord = this.wordRepository.create(word);
		const savedWord = await this.wordRepository.save(newWord);
		this.wordEventService.emit({ type: "create", word: savedWord });
		return savedWord;
	}

	async update(word: Partial<WordEntity>): Promise<WordEntity | null> {
		const existingWord = await this.findOne(word.id);
		if (!existingWord) {
			return null;
		}
		Object.assign(existingWord, word);
		const updatedWord = await this.wordRepository.save(existingWord);
		this.wordEventService.emit({ type: "update", word: updatedWord });
		return updatedWord;
	}

	async remove(id: WordEntity["id"]): Promise<void> {
		const word = await this.findOne(id);
		if (word) {
			await this.wordTranslationService.removeByWordId(id);
			await this.wordRepository.delete({ id });
			this.wordEventService.emit({ type: "delete", word });
		}
	}

	async removeMany(ids: WordEntity["id"][]): Promise<number> {
		if (ids.length === 0) return 0;
		const words = await this.wordRepository.find({
			where: { id: In(ids) },
		});
		for (const word of words) {
			await this.wordTranslationService.removeByWordId(word.id);
		}
		const result = await this.wordRepository.delete({ id: In(ids) });
		for (const word of words) {
			this.wordEventService.emit({ type: "delete", word });
		}
		this.logger.log(`Deleted ${result.affected ?? 0} words: ${ids.join(", ")}`);
		return result.affected ?? 0;
	}

	async markProcessing(ids: number[]): Promise<void> {
		if (ids.length === 0) return;
		await this.wordRepository.update(ids, { status: "processing" });
		// Emit events for updated words
		const updatedWords = await this.wordRepository.find({
			where: { id: In(ids) },
		});
		for (const word of updatedWords) {
			this.wordEventService.emit({ type: "update", word });
		}
	}

	async markProcessed(ids: number[]): Promise<void> {
		if (ids.length === 0) return;
		await this.wordRepository.update(ids, { status: "processed" });
		// Emit events for updated words
		const updatedWords = await this.wordRepository.find({
			where: { id: In(ids) },
		});
		for (const word of updatedWords) {
			this.wordEventService.emit({ type: "update", word });
		}
	}

	async generateWords(
		language: Language,
		topicId?: number,
		catalogId?: number,
		limit?: number,
	): Promise<void> {
		const existingWords = await this.wordRepository.find({
			where: { language },
		});

		const except = existingWords.map((w) => w.word);

		const topicEntity =
			topicId != null ? await this.topicService.findOne(topicId) : null;
		const catalogEntity =
			catalogId != null
				? await this.vocabCatalogService.findOne(catalogId)
				: null;

		if (topicId != null && !topicEntity) {
			throw new Error(`Topic with id ${topicId} not found`);
		}

		if (catalogId != null && !catalogEntity) {
			throw new Error(`Catalog with id ${catalogId} not found`);
		}

		this.logger.log(
			`Queueing word generation in ${language}, except: ${except.join(", ")}`,
		);

		await this.openAIQueue.add(WORDS_GENERATION_START, {
			language,
			except,
			topic: topicEntity?.title,
			level: catalogEntity?.title,
			topicId: topicEntity?.id,
			catalogId: catalogEntity?.id,
			limit,
		});
	}

	async makeAudio(
		language: string,
		word: string,
		wordId: WordEntity["id"],
	): Promise<void> {
		this.openAIQueue.add(AUDIO_CREATION_START, { language, word, wordId });
	}

	async wordsGenerated(
		words: GeneratedWord[],
		topicId?: number,
		catalogId?: number,
	): Promise<void> {
		const forcedTopic =
			topicId != null ? await this.topicService.findOne(topicId) : null;
		const forcedCatalog =
			catalogId != null
				? await this.vocabCatalogService.findOne(catalogId)
				: null;

		if (topicId != null && !forcedTopic) {
			throw new Error(`Topic with id ${topicId} not found`);
		}

		if (catalogId != null && !forcedCatalog) {
			throw new Error(`Catalog with id ${catalogId} not found`);
		}

		const normalizedTopic = forcedTopic?.title;
		const normalizedLevel = forcedCatalog?.title;

		const wordsTopics = words.reduce<Set<string>>((acc, wordData) => {
			acc.add(normalizedTopic ?? wordData.topic);
			return acc;
		}, new Set<string>());

		const wordsCatalogs = words.reduce<Set<string>>((acc, wordData) => {
			acc.add(normalizedLevel ?? wordData.level);
			return acc;
		}, new Set<string>());

		this.logger.log(
			`Generated ${words.length} words, topics: ${Array.from(wordsTopics).join(
				", ",
			)}, catalogs: ${Array.from(wordsCatalogs).join(", ")}`,
		);

		const topics = forcedTopic
			? [forcedTopic]
			: await this.topicService.findAllAndCreateIfNotExist(
					Array.from(wordsTopics.values()),
					words[0].language,
				);
		const catalogs = forcedCatalog
			? [forcedCatalog]
			: await this.vocabCatalogService.findAllAndCreateIfNotExist(
					Array.from(wordsCatalogs.values()),
					words[0].language,
				);

		const topicMap = new Map(topics.map((t) => [t.title, t.id]));
		const catalogMap = new Map(catalogs.map((c) => [c.title, c.id]));

		this.logger.log("Saving generated words to database...");

		const wordsPromises = words.map(async (wordData) => {
			const topicKey = normalizedTopic ?? wordData.topic;
			const catalogKey = normalizedLevel ?? wordData.level;
			// create() already emits the event, so we don't need to emit it again
			const word = await this.create({
				word: wordData.word,
				topic:
					forcedTopic?.id ??
					topicMap.get(topicKey) ??
					topicMap.get(wordData.topic),
				catalog:
					forcedCatalog?.id ??
					catalogMap.get(catalogKey) ??
					catalogMap.get(wordData.level),
				meaning: wordData.meaning,
				created_at: new Date().toISOString(),
				language: wordData.language,
				audio: "",
				transcribtion: wordData.transcription,
				score: wordData.score,
				status: "processing",
			});

			this.makeAudio(wordData.language, wordData.word, word.id);

			return word;
		});

		this.logger.log("Waiting for all words to be saved to the database...");

		const createdWords = await Promise.all(wordsPromises);

		this.logger.log(
			`Created ${createdWords.length} words, initiating translations...`,
		);

		this.makeTranslationsForWords(createdWords);
	}

	makeTranslationsForWords(words: WordEntity[]) {
		this.translationQueue.add(TRANSLATION_START, {
			words,
		});
	}

	async retranslateWord(wordId: WordEntity["id"]): Promise<WordEntity | null> {
		const word = await this.findOne(wordId);
		if (!word) return null;

		await this.wordTranslationService.removeByWordId(wordId);
		await this.markProcessing([wordId]);
		this.makeTranslationsForWords([word]);

		this.logger.log(
			`Retranslation queued for word ${word.word} (id: ${wordId})`,
		);
		return word;
	}

	async regenerateAudio(wordId: WordEntity["id"]): Promise<WordEntity | null> {
		const word = await this.findOne(wordId);
		if (!word) return null;

		await this.wordRepository.update(wordId, {
			audio: "",
			status: "processing",
		});
		const updatedWord = await this.findOne(wordId);
		if (updatedWord) {
			this.wordEventService.emit({ type: "update", word: updatedWord });
		}

		this.makeAudio(word.language, word.word, wordId);
		this.logger.log(
			`Audio regeneration queued for word ${word.word} (id: ${wordId})`,
		);
		return updatedWord ?? word;
	}

	/**
	 * Calls when audio is created for word
	 * @param filename filename to create
	 * @param audio base64 audio data to save as file
	 * @param wordId wordId this file belongs to
	 * @returns
	 */
	async audioMade(filename: string, audio: string, wordId: WordEntity["id"]) {
		const word = await this.findOne(wordId);

		if (!word) {
			this.logger.warn(`Word with id ${wordId} not found for audio update`);
			return;
		}

		const uniqueFilename = `${word.id}-${filename}`;

		if (word.audio) {
			await this.gcsService.deleteFileByUrl(word.audio);
		}

		const url = await this.gcsService.uploadMp3FromBase64(
			word.language,
			audio,
			uniqueFilename,
		);

		word.audio = url;

		const updatedWord = await this.wordRepository.save(word);
		this.wordEventService.emit({ type: "update", word: updatedWord });

		const translationCount = await this.wordTranslationService.count({
			words: [wordId],
		});

		if (translationCount > 0 && updatedWord.status !== "processed") {
			await this.wordRepository.update(wordId, { status: "processed" });
			const processedWord = await this.findOne(wordId);
			if (processedWord) {
				this.wordEventService.emit({ type: "update", word: processedWord });
			}
		}

		this.logger.log(
			`Audio updated for word id ${wordId}, filename: ${uniqueFilename}`,
		);
	}
}
