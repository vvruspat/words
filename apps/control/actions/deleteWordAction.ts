"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function deleteWordAction(wordId: number): Promise<boolean> {
	const response = await fetchWordsApi(`/word/${wordId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error(response.statusText || "Failed to delete word");
	}

	return true;
}
