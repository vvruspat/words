import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	WORD_DUPLICATE_GROUP_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import { WordEntity } from "./word.entity";
import { WordDuplicateGroupEntity } from "./word-duplicate-group.entity";

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
];
