import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { TOPIC_TRANSLATION_DONE } from "~/constants/queue-events.constants";
import { TOPIC_TRANSLATIONS_QUEUE } from "~/constants/queues.constants";
import type { TopicEntity } from "~/topic/topic.entity";
import { TopicTranslationService } from "./topictranslation.service";
import { isTopicTranslationsArray } from "./types/generated-topic-translations";

@Processor(TOPIC_TRANSLATIONS_QUEUE)
@Injectable()
export class TopicTranslationQueueProcessor extends WorkerHost {
	private readonly logger = new Logger(TopicTranslationQueueProcessor.name);

	constructor(
		private readonly topicTranslationService: TopicTranslationService,
	) {
		super();
	}

	async process(job: Job) {
		this.logger.log(
			`Processing job: ${job.name} in TopicTranslationQueueProcessor`,
			job.data,
		);
		switch (job.name) {
			case TOPIC_TRANSLATION_DONE:
				return this.translationsMade(
					job.data.generatedTranslations,
					job.data.topics,
				);
			default:
				throw new Error(`Unknown job name: ${job.name}`);
		}
	}

	private async translationsMade(
		generatedTranslations: unknown,
		topics: TopicEntity[],
	) {
		if (isTopicTranslationsArray(generatedTranslations)) {
			await this.topicTranslationService.translationsMade(
				generatedTranslations,
				topics,
			);
		} else {
			this.logger.error(
				"Invalid topic translations data format",
				generatedTranslations,
			);
		}
	}
}
