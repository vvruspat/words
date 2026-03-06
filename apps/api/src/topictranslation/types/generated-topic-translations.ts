export type GeneratedTopicTranslation = {
	topic: string;
	translations: {
		language: string;
		translation: string;
	}[];
};

export function isTopicTranslationsArray(
	data: unknown,
): data is GeneratedTopicTranslation[] {
	return (
		Array.isArray(data) &&
		data.every(
			(item) =>
				typeof item === "object" &&
				item !== null &&
				"topic" in item &&
				"translations" in item &&
				Array.isArray(item.translations) &&
				item.translations.every(
					(t) =>
						typeof t === "object" &&
						t !== null &&
						"language" in t &&
						"translation" in t,
				),
		)
	);
}
