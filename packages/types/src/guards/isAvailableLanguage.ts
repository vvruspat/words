import { AVAILABLE_LANGUAGES, Language } from "../common";

export const isAvailableLanguage = (
	language?: string,
): language is Language => {
	if (!language) return false;

	return Object.keys(AVAILABLE_LANGUAGES).includes(language);
};
