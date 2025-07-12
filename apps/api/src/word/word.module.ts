import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { WordController } from "./word.controller";
import { wordProviders } from "./word.providers";
import { WordService } from "./word.service";

@Module({
	imports: [DatabaseModule],
	providers: [...wordProviders, WordService],
	controllers: [WordController],
})
export class WordModule {}
