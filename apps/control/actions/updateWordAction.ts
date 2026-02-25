"use server";

import { $fetch } from "@/lib/fetch";

export async function updateWordAction(id: number, word: string) {
	return await $fetch("/word", "put", {
		body: { id, word },
	});
}
