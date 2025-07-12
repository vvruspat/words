import { VOCABCATALOG_REPOSITORY } from "../constants/database.constants";
import { VocabCatalogEntity } from "./vocabcatalog.entity";

export const vocabCatalogProviders = [
	{
		provide: VOCABCATALOG_REPOSITORY,
		useValue: VocabCatalogEntity,
	},
];
