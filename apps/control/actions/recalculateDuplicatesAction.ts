"use server";

import { $fetch } from "@/lib/fetch";

export async function recalculateDuplicatesAction(): Promise<{ queued: number }> {
	return await $fetch("/word/recalculate-duplicates", "post", {});
}
