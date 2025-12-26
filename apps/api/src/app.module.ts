import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { GcsModule } from "./gcs/gcs.module";
import { LearningModule } from "./learning/learning.module";
import { MailerModule } from "./mailer/mailer.module";
import { OpenAIModule } from "./openai/openai.module";
import { QueuesModule } from "./queues/queues.module";
import { RedisModule } from "./redis/redis.module";
import { TopicModule } from "./topic/topic.module";
import { TrainingModule } from "./training/training.module";
import { UserModule } from "./user/user.module";
import { VocabCatalogModule } from "./vocabcatalog/vocabcatalog.module";
import { WordModule } from "./word/word.module";
import { WordTranslationModule } from "./wordstranslation/wordstranslation.module";

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
		WordTranslationModule,
		MailerModule,
		RedisModule,
		AuthModule,
		OpenAIModule,
		GcsModule,
		BullModule.forRoot({
			connection: {
				host: "localhost",
				port: 6379,
			},
		}),
		QueuesModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
