import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Job } from "bullmq";
import {
	TRANSLATION_DONE,
	TRANSLATION_START,
} from "~/constants/queue-events.constants";
import { TRANSLATIONS_QUEUE } from "~/constants/queues.constants";
import { WordEntity } from "~/word/word.entity";
import { isWordsTranslationsArray } from "./types/generated-translations";
import { WordTranslationService } from "./wordstranslation.service";

@Processor(TRANSLATIONS_QUEUE)
@Injectable()
export class WordsTranslationQueueProcessor extends WorkerHost {
	constructor(private readonly wordTranslationService: WordTranslationService) {
		super();
	}

	async process(job: Job) {
		console.log(
			`Processing job: ${job.name} in WordTranslationQueueProcessor`,
			job.data,
		);
		switch (job.name) {
			case TRANSLATION_START:
				return this.makeTranslations(job.data.words);
			case TRANSLATION_DONE:
				return this.translationsMade(
					job.data.generatedTranslations,
					job.data.words,
				);
			default:
				throw new Error(`Unknown job name: ${job.name}`);
		}
	}

	private async makeTranslations(words: WordEntity[]) {
		console.log(
			`Making translations for words: ${words.map((w) => w.word).join(", ")}`,
		);
		this.wordTranslationService.makeTranslations(words);
	}

	private async translationsMade(
		generatedTranslations: unknown,
		words: WordEntity[],
	) {
		if (isWordsTranslationsArray(generatedTranslations)) {
			this.wordTranslationService.translationsMade(
				generatedTranslations,
				words,
			);
		} else {
			throw new Error("Invalid translations data format");
		}
	}
}
