import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	WORD_DUPLICATE_GROUP_REPOSITORY,
	WORD_REPOSITORY,
	WORD_SYNONYM_GROUP_REPOSITORY,
} from "../constants/database.constants";
import { WordEntity } from "./word.entity";
import { WordDuplicateGroupEntity } from "./word-duplicate-group.entity";
import { WordSynonymGroupEntity } from "./word-synonym-group.entity";

export const wordProviders = [
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
	{
		provide: WORD_DUPLICATE_GROUP_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordDuplicateGroupEntity),
		inject: [DATA_SOURCE],
	},
	{
		provide: WORD_SYNONYM_GROUP_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordSynonymGroupEntity),
		inject: [DATA_SOURCE],
	},
];
