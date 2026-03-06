"use server";

import { $fetch } from "@/lib/fetch";

export async function addTopicTranslationAction(
	topicId: number,
	translation: string,
	language: string,
) {
	return await $fetch("/topic-translation", "post", {
		body: {
			topic: topicId,
			translation,
			language,
			created_at: new Date().toISOString(),
		},
	});
}
