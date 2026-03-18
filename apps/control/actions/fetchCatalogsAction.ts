"use server";

import { $fetch } from "../lib/fetch";

export async function fetchCatalogsAction(language?: string) {
	return await $fetch("/vocabcatalog", "get", {
		query: {
			offset: 0,
			limit: 2000,
			...(language ? { language } : {}),
		},
	});
}
