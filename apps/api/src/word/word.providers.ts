import type { DataSource } from "typeorm";
import { DATA_SOURCE, WORD_REPOSITORY } from "../constants/database.constants";
import { WordEntity } from "./word.entity";

export const wordProviders = [
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
];
