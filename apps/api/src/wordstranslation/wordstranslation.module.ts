import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { WordTranslationController } from "./wordstranslation.controller";
import { wordsTranslationProviders } from "./wordstranslation.providers";
import { WordsTranslationQueueProcessor } from "./wordstranslation.queue.processor";
import { WordTranslationService } from "./wordstranslation.service";

@Module({
	imports: [DatabaseModule],
	providers: [
		...wordsTranslationProviders,
		WordTranslationService,
		WordsTranslationQueueProcessor,
	],
	controllers: [WordTranslationController],
	exports: [WordTranslationService],
})
export class WordTranslationModule {}
