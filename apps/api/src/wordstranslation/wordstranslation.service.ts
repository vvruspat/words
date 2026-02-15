import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { FindOptionsWhere, Repository } from "typeorm";
import { In } from "typeorm";
import { TRANSLATION_START } from "~/constants/queue-events.constants";
import { OPENAI_QUEUE } from "~/constants/queues.constants";
import type { WordEntity } from "~/word/word.entity";
import { WordEventService } from "~/word/word-event.service";
import {
	WORD_REPOSITORY,
	WORDS_TRANSLATION_REPOSITORY,
} from "../constants/database.constants";
import type { GeneratedTranslation } from "./types/generated-translations";
import type { WordTranslationEntity } from "./wordstranslation.entity";

@Injectable()
export class WordTranslationService {
	private readonly logger = new Logger(WordTranslationService.name);

	constructor(
		@Inject(WORDS_TRANSLATION_REPOSITORY)
		private wordsTranslationRepository: Repository<WordTranslationEntity>,
		@Inject(WORD_REPOSITORY)
		private wordRepository: Repository<WordEntity>,
		@InjectQueue(OPENAI_QUEUE) private openAIQueue: Queue,
		private readonly wordEventService: WordEventService,
	) {}

	async findAll(
		filters: Partial<WordTranslationEntity> & {
			words?: WordTranslationEntity["word"][] | string;
		},
	): Promise<WordTranslationEntity[]> {
		const { words, ...restFilters } = filters;
		const where: FindOptionsWhere<WordTranslationEntity> = {
			...restFilters,
		} as FindOptionsWhere<WordTranslationEntity>;

		// Handle multiple word IDs using In operator
		if (words !== undefined) {
			// Normalize words to an array of numbers
			let wordIds: number[];

			if (Array.isArray(words)) {
				wordIds = words.map((w) =>
					typeof w === "string" ? parseInt(w, 10) : w,
				);
			} else if (typeof words === "string") {
				// Handle comma-separated string
				wordIds = words.split(",").map((w) => parseInt(w.trim(), 10));
			} else {
				wordIds = [words];
			}
			// Filter out any NaN values
			wordIds = wordIds.filter((id) => !Number.isNaN(id));
			if (wordIds.length > 0) {
				where.word = In(wordIds);
			}
		}

		return this.wordsTranslationRepository.find({ where });
	}

	async count(
		filters: Partial<WordTranslationEntity> & {
			words?: WordTranslationEntity["word"][] | string;
		},
	): Promise<number> {
		const { words, ...restFilters } = filters;
		const where: FindOptionsWhere<WordTranslationEntity> = {
			...restFilters,
		} as FindOptionsWhere<WordTranslationEntity>;

		if (words !== undefined) {
			// Normalize words to an array of numbers
			let wordIds: number[];
			if (Array.isArray(words)) {
				wordIds = words.map((w) =>
					typeof w === "string" ? parseInt(w, 10) : w,
				);
			} else if (typeof words === "string") {
				// Handle comma-separated string
				wordIds = words.split(",").map((w) => parseInt(w.trim(), 10));
			} else {
				wordIds = [words];
			}
			// Filter out any NaN values
			wordIds = wordIds.filter((id) => !Number.isNaN(id));
			if (wordIds.length > 0) {
				where.word = In(wordIds);
			}
		}

		return this.wordsTranslationRepository.count({ where });
	}

	async findOne(
		id: WordTranslationEntity["id"],
	): Promise<WordTranslationEntity | null> {
		return this.wordsTranslationRepository.findOneBy({ id });
	}

	async create(
		wordsTranslation: Omit<WordTranslationEntity, "id">,
	): Promise<WordTranslationEntity> {
		const newWordTranslation =
			this.wordsTranslationRepository.create(wordsTranslation);
		return this.wordsTranslationRepository.save(newWordTranslation);
	}

	async update(
		id: WordTranslationEntity["id"],
		wordsTranslation: Partial<WordTranslationEntity>,
	): Promise<WordTranslationEntity | null> {
		await this.wordsTranslationRepository.update({ id }, wordsTranslation);
		return this.findOne(id);
	}

	async remove(id: WordTranslationEntity["id"]): Promise<void> {
		await this.wordsTranslationRepository.delete({ id });
	}

	async removeByWordId(wordId: WordTranslationEntity["word"]): Promise<void> {
		await this.wordsTranslationRepository.delete({ word: wordId });
	}

	async makeTranslations(words: WordEntity[]): Promise<void> {
		this.logger.log(
			`Enqueuing translation job for words: ${words
				.map((w) => w.word)
				.join(", ")}`,
		);
		this.openAIQueue.add(TRANSLATION_START, {
			words,
			language: words[0].language,
		});
	}

	async translationsMade(
		generatedTranslations: GeneratedTranslation[],
		words: WordEntity[],
	): Promise<void> {
		this.logger.log(
			`Storing generated translations for words: ${words
				.map((w) => w.word)
				.join(", ")}`,
		);
		const wordsMap = new Map<string, WordEntity>(
			words.map((word) => [word.word, word]),
		);

		// Create all translations

		for (const wordWithTranslations of generatedTranslations) {
			const word = wordsMap.get(wordWithTranslations.word);
			if (!word) {
				this.logger.error(
					`Word ${wordWithTranslations.word} not found in words map`,
					generatedTranslations,
				);
				continue;
			}

			for (const translationItem of wordWithTranslations.translations) {
				await this.create({
					word: word.id,
					translation: translationItem.translation,
					language: translationItem.language,
					created_at: new Date().toISOString(),
				});
			}
		}

		const wordIds = Array.from(
			new Set(words.map((word) => word.id).filter(Boolean)),
		);

		if (wordIds.length > 0) {
			const currentWords = await this.wordRepository.find({
				where: { id: In(wordIds) },
			});

			for (const currentWord of currentWords) {
				// Notify UI that translations exist even if status doesn't change.
				this.wordEventService.emit({
					type: "update",
					word: currentWord,
				});

				if (!currentWord.audio || currentWord.status === "processed") continue;
				await this.wordRepository.update(currentWord.id, {
					status: "processed",
				});
				const processedWord = await this.wordRepository.findOneBy({
					id: currentWord.id,
				});
				if (processedWord) {
					this.wordEventService.emit({
						type: "update",
						word: processedWord,
					});
				}
			}
		}
	}
}
