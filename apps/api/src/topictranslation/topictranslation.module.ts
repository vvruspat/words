import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { TopicModule } from "~/topic/topic.module";
import { TopicTranslationController } from "./topictranslation.controller";
import { topicTranslationProviders } from "./topictranslation.providers";
import { TopicTranslationQueueProcessor } from "./topictranslation.queue.processor";
import { TopicTranslationService } from "./topictranslation.service";

@Module({
	imports: [DatabaseModule, TopicModule],
	providers: [
		...topicTranslationProviders,
		TopicTranslationService,
		TopicTranslationQueueProcessor,
	],
	controllers: [TopicTranslationController],
	exports: [TopicTranslationService],
})
export class TopicTranslationModule {}
