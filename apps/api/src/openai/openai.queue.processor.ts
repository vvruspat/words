import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Language } from "@repo/types";
import { Job } from "bullmq";
import {
	AUDIO_CREATION_START,
	TRANSLATION_START,
	WORDS_GENERATION_START,
} from "~/constants/queue-events.constants";
import { OPENAI_QUEUE } from "~/constants/queues.constants";
import { WordEntity } from "~/word/word.entity";
import { OpenAIService } from "./openai.service";

@Processor(OPENAI_QUEUE)
@Injectable()
export class OpenAIQueueProcessor extends WorkerHost {
	constructor(private readonly openAIService: OpenAIService) {
		super();
	}

	async process(job: Job) {
		console.log(`Processing job: ${job.name}`);
		switch (job.name) {
			case TRANSLATION_START:
				return this.translateWords(job.data.language, job.data.words ?? []);
			case WORDS_GENERATION_START:
				return this.generateWords(job.data.language, job.data.except ?? []);
			case AUDIO_CREATION_START:
				return this.makeAudio(
					job.data.language,
					job.data.word,
					job.data.wordId,
				);
			default:
				throw new Error(`Unknown job name: ${job.name}`);
		}
	}

	private async translateWords(language: string, words: WordEntity[]) {
		console.log(
			`Translating words to ${language}: ${words.map((word) => word.word).join(", ")}`,
		);
		this.openAIService.translateWords(language, words);
	}

	private async generateWords(language: string, except: string[]) {
		console.log(
			`Generating words in ${language}, except: ${except.join(", ")}`,
		);
		this.openAIService.generateWords(language, except);
	}

	private async makeAudio(
		language: Language,
		word: string,
		wordId: WordEntity["id"],
	) {
		console.log(`Making audio in ${language} for word: ${word}`);
		await this.openAIService.makeAudio(language, word, wordId);
	}
}
