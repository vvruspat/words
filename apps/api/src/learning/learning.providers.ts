import {
	LEARNING_DATA_REPOSITORY,
	LEARNING_REPOSITORY,
} from "../constants/database.constants";
import { LearningDataEntity, LearningEntity } from "./learning.entity";

export const learningProviders = [
	{
		provide: LEARNING_REPOSITORY,
		useValue: LearningEntity,
	},
	{
		provide: LEARNING_DATA_REPOSITORY,
		useValue: LearningDataEntity,
	},
];
