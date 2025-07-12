import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { WordsTranslationController } from "./wordstranslation.controller";
import { wordsTranslationProviders } from "./wordstranslation.providers";
import { WordsTranslationService } from "./wordstranslation.service";

@Module({
	imports: [DatabaseModule],
	providers: [...wordsTranslationProviders, WordsTranslationService],
	controllers: [WordsTranslationController],
})
export class WordsTranslationModule {}
