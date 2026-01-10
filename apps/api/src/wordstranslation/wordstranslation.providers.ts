import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	WORDS_TRANSLATION_REPOSITORY,
} from "../constants/database.constants";
import { WordTranslationEntity } from "./wordstranslation.entity";

export const wordsTranslationProviders = [
	{
		provide: WORDS_TRANSLATION_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordTranslationEntity),
		inject: [DATA_SOURCE],
	},
];
