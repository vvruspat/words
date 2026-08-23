"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function retranslateWordAction(wordId: number): Promise<boolean> {
	const response = await fetchWordsApi(`/word/${wordId}/retranslate`, {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error(response.statusText || "Failed to retranslate word");
	}

	return true;
}
