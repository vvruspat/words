"use server";

import { $fetch } from "../lib/fetch";

export async function fetchTopicsAction(language?: string) {
	return await $fetch("/topic", "get", {
		query: {
			offset: 0,
			limit: 2000,
			...(language ? { language } : {}),
		},
	});
}
