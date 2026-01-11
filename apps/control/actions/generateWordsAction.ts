"use server";

import { $fetch } from "../lib/fetch";

export async function generateWordsAction(
	language: string,
	topic: string,
	level: string,
	limit?: number,
): Promise<boolean> {
	await $fetch("/word/generate", "post", {
		query: { language, topic, level, limit },
	});
	return true;
}
