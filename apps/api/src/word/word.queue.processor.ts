import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import {
	AUDIO_CREATION_DONE,
	WORDS_GENERATION_DONE,
} from "~/constants/queue-events.constants";
import { WORDS_QUEUE } from "~/constants/queues.constants";
import { isWordsArray } from "./types/generated-word";
import type { WordEntity } from "./word.entity";
import type { WordService } from "./word.service";

@Processor(WORDS_QUEUE)
@Injectable()
export class WordQueueProcessor extends WorkerHost {
	private readonly logger = new Logger(WordQueueProcessor.name);

	constructor(private readonly wordService: WordService) {
		super();
	}

	async process(job: Job) {
		this.logger.log(`Processing job: ${job.name}`);

		switch (job.name) {
			case WORDS_GENERATION_DONE:
				return this.wordsGenerated(job.data.words);
			case AUDIO_CREATION_DONE:
				return this.audioMade(
					job.data.filename,
					job.data.audio,
					job.data.wordId,
				);
			default:
				throw new Error(`Unknown job name: ${job.name}`);
		}
	}

	private async wordsGenerated(words: unknown) {
		this.logger.log(`Generated word data: ${JSON.stringify(words)}`);
		if (isWordsArray(words)) {
			this.wordService.wordsGenerated(words);
		} else {
			throw new Error("Invalid word data format");
		}
	}

	private async audioMade(
		filename: string,
		audio: string,
		wordId: WordEntity["id"],
	) {
		this.logger.log(
			`Audio made for word ID ${wordId} with filename ${filename}`,
		);
		this.wordService.audioMade(filename, audio, wordId);
	}
}
