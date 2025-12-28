import { Word } from "database";

export function isWord(data: unknown): data is Word {
	return (
		typeof data === "object" &&
		data !== null &&
		"id" in data &&
		"word" in data &&
		"topic" in data &&
		"catalog" in data &&
		"language" in data &&
		"audio" in data &&
		"transcribtion" in data &&
		"status" in data
	);
}
