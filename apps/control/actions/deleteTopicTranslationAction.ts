"use server";

import { $fetch } from "@/lib/fetch";

export async function deleteTopicTranslationAction(id: number) {
	return await $fetch("/topic-translation/{id}", "delete", {
		params: { id },
	});
}
