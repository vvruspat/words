import { Module } from "@nestjs/common";
import { AuthModule } from "~/auth/auth.module";
import { LearningModule } from "~/learning/learning.module";
import { TopicModule } from "~/topic/topic.module";
import { UserModule } from "~/user/user.module";
import { UserVocabularyModule } from "~/user-vocabulary/user-vocabulary.module";
import { VocabCatalogModule } from "~/vocabcatalog/vocabcatalog.module";
import { WordModule } from "~/word/word.module";
import { WordTranslationModule } from "~/wordstranslation/wordstranslation.module";
import { McpController } from "./mcp.controller";
import { McpToolsService } from "./mcp-tools.service";

@Module({
	imports: [
		AuthModule,
		LearningModule,
		TopicModule,
		UserModule,
		VocabCatalogModule,
		WordModule,
		WordTranslationModule,
		UserVocabularyModule,
	],
	controllers: [McpController],
	providers: [McpToolsService],
})
export class McpModule {}
