import type { DataSource } from "typeorm";
import { WordEntity } from "~/word/word.entity";
import {
	DATA_SOURCE,
	WORD_REPOSITORY,
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
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
];
