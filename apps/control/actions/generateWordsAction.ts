"use server";

import { $fetch } from "../lib/fetch";

export async function generateWordsAction(
	language: string,
	topic: string,
	level: string,
): Promise<boolean> {
	await $fetch("/word/generate", "post", {
		query: { language, topic, level },
	});
	return true;
}
