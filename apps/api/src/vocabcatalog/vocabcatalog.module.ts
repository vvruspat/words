import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { VocabCatalogController } from "./vocabcatalog.controller";
import { vocabCatalogProviders } from "./vocabcatalog.providers";
import { VocabCatalogService } from "./vocabcatalog.service";

@Module({
	imports: [DatabaseModule],
	providers: [...vocabCatalogProviders, VocabCatalogService],
	controllers: [VocabCatalogController],
})
export class VocabCatalogModule {}
