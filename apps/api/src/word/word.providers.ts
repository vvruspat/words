import { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	WORD_DATA_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import { WordDataEntity, WordEntity } from "./word.entity";

export const wordProviders = [
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
	{
		provide: WORD_DATA_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordDataEntity),
		inject: [DATA_SOURCE],
	},
];
