import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { TrainingController } from "./training.controller";
import { trainingProviders } from "./training.providers";
import { TrainingService } from "./training.service";

@Module({
	imports: [DatabaseModule],
	providers: [...trainingProviders, TrainingService],
	controllers: [TrainingController],
})
export class TrainingModule {}
