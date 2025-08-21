import { WORDS_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import { WordTranslationEntity } from "./wordstranslation.entity";

export const wordsTranslationProviders = [
	{
		provide: WORDS_TRANSLATION_REPOSITORY,
		useValue: WordTranslationEntity,
	},
];
