"use server";

import { $fetch } from "@/lib/fetch";

export async function updateTopicTranslationAction(
	id: number,
	translation: string,
) {
	return await $fetch("/topic-translation", "put", {
		body: { id, translation },
	});
}
