import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { TopicTranslationController } from "./topictranslation.controller";
import { topicTranslationProviders } from "./topictranslation.providers";
import { TopicTranslationService } from "./topictranslation.service";

@Module({
	imports: [DatabaseModule],
	providers: [...topicTranslationProviders, TopicTranslationService],
	controllers: [TopicTranslationController],
	exports: [TopicTranslationService],
})
export class TopicTranslationModule {}
