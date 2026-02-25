"use server";

import { $fetch } from "@/lib/fetch";

export async function updateTranslationAction(
	id: number,
	translation: string,
) {
	return await $fetch("/words-translation", "put", {
		body: { id, translation },
	});
}
