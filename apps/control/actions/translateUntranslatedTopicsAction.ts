"use server";

import { $fetch } from "@/lib/fetch";

export async function translateUntranslatedTopicsAction(language: string) {
	return await $fetch("/topic-translation/translate-untranslated", "post", {
		body: { language },
	});
}
