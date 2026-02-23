import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	TRAINING_REPOSITORY,
} from "../constants/database.constants";
import { TrainingEntity } from "./training.entity";

export const trainingProviders = [
	{
		provide: TRAINING_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(TrainingEntity),
		inject: [DATA_SOURCE],
	},
];
