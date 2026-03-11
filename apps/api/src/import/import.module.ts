import { Module } from "@nestjs/common";
import { TopicModule } from "../topic/topic.module";
import { TopicTranslationModule } from "../topictranslation/topictranslation.module";
import { VocabCatalogModule } from "../vocabcatalog/vocabcatalog.module";
import { WordModule } from "../word/word.module";
import { ImportController } from "./import.controller";
import { ImportService } from "./import.service";

@Module({
	imports: [
		TopicModule,
		TopicTranslationModule,
		VocabCatalogModule,
		WordModule,
	],
	providers: [ImportService],
	controllers: [ImportController],
})
export class ImportModule {}
