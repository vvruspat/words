"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function bulkDeleteWordsAction(
	wordIds: number[],
): Promise<{ deleted: number }> {
	if (wordIds.length === 0) return { deleted: 0 };

	const response = await fetchWordsApi("/word/bulk-delete", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ ids: wordIds }),
	});

	if (!response.ok) {
		throw new Error(response.statusText || "Failed to delete words");
	}

	return response.json() as Promise<{ deleted: number }>;
}
