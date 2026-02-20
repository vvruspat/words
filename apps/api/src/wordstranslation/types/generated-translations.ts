import { type Language } from "@vvruspat/words-types";

export type GeneratedTranslation = {
	word: string;
	translations: {
		language: Language;
		translation: string;
	}[];
};

export function isWordsTranslationsArray(
	data: unknown,
): data is GeneratedTranslation[] {
	return (
		Array.isArray(data) &&
		data.every(
			(item) =>
				typeof item === "object" &&
				item !== null &&
				"word" in item &&
				"translations" in item &&
				Array.isArray(item.translations) &&
				item.translations.every(
					(translation) =>
						typeof translation === "object" &&
						translation !== null &&
						"language" in translation &&
						"translation" in translation,
				),
		)
	);
}
