import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Queue } from "bullmq";
import type { Repository } from "typeorm";
import { TRANSLATION_START } from "~/constants/queue-events.constants";
import { OPENAI_QUEUE } from "~/constants/queues.constants";
import { WordEntity } from "~/word/word.entity";
import { WORDS_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import { GeneratedTranslation } from "./types/generated-translations";
import type { WordTranslationEntity } from "./wordstranslation.entity";

@Injectable()
export class WordTranslationService {
	private readonly logger = new Logger(WordTranslationService.name);

	constructor(
		@Inject(WORDS_TRANSLATION_REPOSITORY)
		private wordsTranslationRepository: Repository<WordTranslationEntity>,
		@InjectQueue(OPENAI_QUEUE) private openAIQueue: Queue,
	) {}

	async findAll(): Promise<WordTranslationEntity[]> {
		return this.wordsTranslationRepository.find();
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

	async makeTranslations(words: WordEntity[]): Promise<void> {
		console.log(
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

		generatedTranslations.forEach(async (translation) => {
			const word = wordsMap.get(translation.word);
			if (!word) return;

			Object.keys(translation).forEach(async (key) => {
				if (key === "word") return;

				this.logger.log(
					`Creating translation for word ${word.word} in language ${key}: ${translation[key]}`,
				);

				await this.create({
					word: word.id,
					translation: translation[key],
					language: key,
					created_at: new Date().toISOString(),
				});
			});
		});
	}
}
