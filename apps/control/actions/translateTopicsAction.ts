"use server";

import { $fetch } from "@/lib/fetch";

export async function translateTopicsAction(topicIds: number[]) {
	return await $fetch("/topic-translation/translate", "post", {
		body: { topicIds },
	});
}
