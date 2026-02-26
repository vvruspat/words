"use server";

import { $fetch } from "../lib/fetch";

export async function fetchWordByIdAction(id: number) {
	const result = await $fetch("/word", "get", {
		query: {
			id,
			offset: 0,
			limit: 1,
		},
	});
	return result.items[0] ?? null;
}
