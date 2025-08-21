import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { WordTranslationController } from "./wordstranslation.controller";
import { wordsTranslationProviders } from "./wordstranslation.providers";
import { WordTranslationService } from "./wordstranslation.service";

@Module({
	imports: [DatabaseModule],
	providers: [...wordsTranslationProviders, WordTranslationService],
	controllers: [WordTranslationController],
})
export class WordTranslationModule {}
