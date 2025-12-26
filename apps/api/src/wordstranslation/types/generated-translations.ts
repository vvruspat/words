import { AVAILABLE_LANGUAGES, type Language } from "@repo/types";

export type GeneratedTranslation = {
	word: string;
} & {
	[lang in Language]: string;
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
				typeof item.word === "string" &&
				Object.keys(AVAILABLE_LANGUAGES).every(
					(lang) => lang in item && typeof item[lang] === "string",
				),
		)
	);
}
