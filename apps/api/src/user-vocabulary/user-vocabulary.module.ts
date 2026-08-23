import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { LearningModule } from "~/learning/learning.module";
import { TopicModule } from "~/topic/topic.module";
import { VocabCatalogModule } from "~/vocabcatalog/vocabcatalog.module";
import { WordModule } from "~/word/word.module";
import { WordTranslationModule } from "~/wordstranslation/wordstranslation.module";
import { UserVocabularyController } from "./user-vocabulary.controller";
import { userVocabularyProviders } from "./user-vocabulary.providers";
import { UserVocabularyService } from "./user-vocabulary.service";

@Module({
	imports: [
		DatabaseModule,
		LearningModule,
		TopicModule,
		VocabCatalogModule,
		WordModule,
		WordTranslationModule,
	],
	controllers: [UserVocabularyController],
	providers: [...userVocabularyProviders, UserVocabularyService],
	exports: [UserVocabularyService],
})
export class UserVocabularyModule {}
