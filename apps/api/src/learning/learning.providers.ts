import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	LEARNING_REPOSITORY,
} from "../constants/database.constants";
import { LearningEntity } from "./learning.entity";

export const learningProviders = [
	{
		provide: LEARNING_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(LearningEntity),
		inject: [DATA_SOURCE],
	},
];
