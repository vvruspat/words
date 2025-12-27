"use server";

import { $fetch } from "../lib/fetch";

export async function fetchCatalogsAction(language: string) {
	return await $fetch("/vocabcatalog", "get", {
		query: { offset: 0, limit: 100, language },
	});
}
