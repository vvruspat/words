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
		data.some(
			(item) =>
				typeof item.word === "string" &&
				Object.keys(AVAILABLE_LANGUAGES).some(
					(lang) => typeof item[lang] === "string",
				),
		)
	);
}
