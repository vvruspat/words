import { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	VOCABCATALOG_REPOSITORY,
} from "../constants/database.constants";
import { VocabCatalogEntity } from "./vocabcatalog.entity";

export const vocabCatalogProviders = [
	{
		provide: VOCABCATALOG_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(VocabCatalogEntity),
		inject: [DATA_SOURCE],
	},
];
