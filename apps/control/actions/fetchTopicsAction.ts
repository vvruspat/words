"use server";

import { $fetch } from "../lib/fetch";

export async function fetchTopicsAction() {
	return await $fetch("/topic", "get", {
		query: { offset: 0, limit: 100 },
	});
}
