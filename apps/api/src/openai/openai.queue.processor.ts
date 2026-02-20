import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Language } from "@vvruspat/words-types";
import type { Job } from "bullmq";
import {
	AUDIO_CREATION_START,
	TRANSLATION_START,
	WORDS_GENERATION_START,
} from "~/constants/queue-events.constants";
import { OPENAI_QUEUE } from "~/constants/queues.constants";
import type { WordEntity } from "~/word/word.entity";
import { OpenAIService } from "./openai.service";

@Processor(OPENAI_QUEUE)
@Injectable()
export class OpenAIQueueProcessor extends WorkerHost {
	private readonly logger = new Logger(OpenAIQueueProcessor.name);

	constructor(private readonly openAIService: OpenAIService) {
		super();
	}

	async process(job: Job) {
		this.logger.log(`Processing job: ${job.name}`, job.data);
		switch (job.name) {
			case TRANSLATION_START:
				return this.translateWords(job.data.language, job.data.words ?? []);
			case WORDS_GENERATION_START:
				return this.generateWords(
					job.data.language,
					job.data.except ?? [],
					job.data.topic,
					job.data.level,
					job.data.limit,
					job.data.topicId,
					job.data.catalogId,
				);
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
		this.logger.log(
			`Translating words to ${language}: ${words.map((word) => word.word).join(", ")}`,
		);
		this.openAIService.translateWords(language, words);
	}

	private async generateWords(
		language: string,
		except: string[],
		topic?: string,
		level?: string,
		limit?: number,
		topicId?: number,
		catalogId?: number,
	) {
		this.logger.log(
			`Generating words in ${language}, except: ${except.join(", ")}`,
		);
		this.openAIService.generateWords(
			language,
			except,
			topic,
			level,
			limit,
			topicId,
			catalogId,
		);
	}

	private async makeAudio(
		language: Language,
		word: string,
		wordId: WordEntity["id"],
	) {
		this.logger.log(`Making audio in ${language} for word: ${word}`);
		await this.openAIService.makeAudio(language, word, wordId);
	}
}
