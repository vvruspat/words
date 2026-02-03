import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ApiPaginatedResponse, Language } from "@repo/types";
import type { Queue } from "bullmq";
import type { Repository } from "typeorm";
import { In } from "typeorm";
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
		const { limit, offset, sortBy, sortOrder, ...restQuery } = query;

		const total = await this.wordRepository.count({
			where: { ...restQuery },
		});

		const words = await this.wordRepository.find({
			where: { ...restQuery },
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
			await this.wordRepository.delete({ id });
			this.wordEventService.emit({ type: "delete", word });
		}
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
		topic: string,
		level: string,
		limit?: number,
	): Promise<void> {
		const existingWords = await this.wordRepository.find({
			where: { language },
		});

		const except = existingWords.map((w) => w.word);

		this.logger.log(
			`Queueing word generation in ${language}, except: ${except.join(", ")}`,
		);

		await this.openAIQueue.add(WORDS_GENERATION_START, {
			language,
			except,
			topic,
			level,
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

	async wordsGenerated(words: GeneratedWord[]): Promise<void> {
		const wordsTopics = words.reduce<Set<string>>((acc, wordData) => {
			acc.add(wordData.topic);
			return acc;
		}, new Set<string>());

		const wordsCatalogs = words.reduce<Set<string>>((acc, wordData) => {
			acc.add(wordData.level);
			return acc;
		}, new Set<string>());

		this.logger.log(
			`Generated ${words.length} words, topics: ${Array.from(wordsTopics).join(
				", ",
			)}, catalogs: ${Array.from(wordsCatalogs).join(", ")}`,
		);

		const topics = await this.topicService.findAllAndCreateIfNotExist(
			Array.from(wordsTopics.values()),
			words[0].language,
		);
		const catalog = await this.vocabCatalogService.findAllAndCreateIfNotExist(
			Array.from(wordsCatalogs.values()),
			words[0].language,
		);

		const topicMap = new Map(topics.map((t) => [t.title, t.id]));
		const catalogMap = new Map(catalog.map((c) => [c.title, c.id]));

		this.logger.log("Saving generated words to database...");

		const wordsPromises = words.map(async (wordData) => {
			// create() already emits the event, so we don't need to emit it again
			const word = await this.create({
				word: wordData.word,
				topic: topicMap.get(wordData.topic),
				catalog: catalogMap.get(wordData.level),
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

		const url = await this.gcsService.uploadMp3FromBase64(
			word.language,
			audio,
			uniqueFilename,
		);

		word.audio = url;

		const updatedWord = await this.wordRepository.save(word);
		this.wordEventService.emit({ type: "update", word: updatedWord });

		this.logger.log(
			`Audio updated for word id ${wordId}, filename: ${uniqueFilename}`,
		);
	}
}
