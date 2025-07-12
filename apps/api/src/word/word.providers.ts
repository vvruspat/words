import {
	WORD_DATA_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import { WordDataEntity, WordEntity } from "./word.entity";

export const wordProviders = [
	{
		provide: WORD_REPOSITORY,
		useValue: WordEntity,
	},
	{
		provide: WORD_DATA_REPOSITORY,
		useValue: WordDataEntity,
	},
];
