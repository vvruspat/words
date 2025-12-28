import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { GcsModule } from "~/gcs/gcs.module";
import { VocabCatalogModule } from "~/vocabcatalog/vocabcatalog.module";
import { TopicModule } from "../topic/topic.module";
import { WordController } from "./word.controller";
import { wordProviders } from "./word.providers";
import { WordQueueProcessor } from "./word.queue.processor";
import { WordService } from "./word.service";
import { WordEventService } from "./word-event.service";

@Module({
	imports: [DatabaseModule, TopicModule, VocabCatalogModule, GcsModule],
	providers: [
		...wordProviders,
		WordService,
		WordQueueProcessor,
		WordEventService,
	],
	controllers: [WordController],
	exports: [WordEventService],
})
export class WordModule {}
