import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { LearningController } from "./learning.controller";
import { learningProviders } from "./learning.providers";
import { LearningService } from "./learning.service";

@Module({
	imports: [DatabaseModule],
	providers: [...learningProviders, LearningService],
	controllers: [LearningController],
	exports: [LearningService],
})
export class LearningModule {}
