import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { LearningModule } from "./learning/learning.module";
import { TopicModule } from "./topic/topic.module";
import { TrainingModule } from "./training/training.module";
import { UserModule } from "./user/user.module";
import { VocabCatalogModule } from "./vocabcatalog/vocabcatalog.module";
import { WordModule } from "./word/word.module";
import { WordsTranslationModule } from "./wordstranslation/wordstranslation.module";

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		LearningModule,
		TopicModule,
		TrainingModule,
		UserModule,
		VocabCatalogModule,
		WordModule,
		WordsTranslationModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
