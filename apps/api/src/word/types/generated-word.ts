import { Language } from "@repo/types";

export type GeneratedWord = {
	score: number;
	word: string;
	topic: string;
	level: string;
	meaning: string;
	language: Language;
	transcription: string;
};

export function isWordsArray(data: unknown): data is GeneratedWord[] {
	return (
		Array.isArray(data) &&
		data.every(
			(item) =>
				typeof item === "object" &&
				item !== null &&
				"word" in item &&
				"meaning" in item &&
				"language" in item &&
				"transcription" in item &&
				"topic" in item &&
				"level" in item &&
				"score" in item,
		)
	);
}
