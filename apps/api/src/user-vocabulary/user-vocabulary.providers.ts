import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	USER_VOCABULARY_REPOSITORY,
} from "~/constants/database.constants";
import { UserVocabularyEntity } from "./user-vocabulary.entity";

export const userVocabularyProviders = [
	{
		provide: USER_VOCABULARY_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(UserVocabularyEntity),
		inject: [DATA_SOURCE],
	},
];
