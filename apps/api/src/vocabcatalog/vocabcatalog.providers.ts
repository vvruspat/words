import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	VOCABCATALOG_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import { WordEntity } from "../word/word.entity";
import { VocabCatalogEntity } from "./vocabcatalog.entity";

export const vocabCatalogProviders = [
	{
		provide: VOCABCATALOG_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(VocabCatalogEntity),
		inject: [DATA_SOURCE],
	},
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
];
