"use server";

import { $fetch } from "../lib/fetch";

export async function generateWordsAction(
	language: string,
	topicId: number,
	catalogId: number,
	limit?: number,
): Promise<boolean> {
	await $fetch("/word/generate", "post", {
		query: { language, topicId, catalogId, limit },
	});
	return true;
}
