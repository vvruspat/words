import { WORDS_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import { WordsTranslationEntity } from "./wordstranslation.entity";

export const wordsTranslationProviders = [
	{
		provide: WORDS_TRANSLATION_REPOSITORY,
		useValue: WordsTranslationEntity,
	},
];
