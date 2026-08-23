"use server";

import type { Language } from "@vvruspat/words-types";
import { fetchWordsApi } from "@/lib/api-auth";

export async function generateEmbeddingsAction(
	language?: Language,
): Promise<{ queued: number }> {
	const params = new URLSearchParams();
	if (language) params.set("language", language);

	const queryString = params.size > 0 ? `?${params.toString()}` : "";
	const response = await fetchWordsApi(`/word/generate-embeddings${queryString}`, {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error(response.statusText || "Failed to generate embeddings");
	}

	return response.json() as Promise<{ queued: number }>;
}
