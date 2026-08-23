"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function regenerateAudioAction(wordId: number): Promise<boolean> {
	const response = await fetchWordsApi(`/word/${wordId}/regenerate-audio`, {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error(response.statusText || "Failed to regenerate audio");
	}

	return true;
}
