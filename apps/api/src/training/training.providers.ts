import { TRAINING_REPOSITORY } from "../constants/database.constants";
import { TrainingEntity } from "./training.entity";

export const trainingProviders = [
	{
		provide: TRAINING_REPOSITORY,
		useValue: TrainingEntity,
	},
];
