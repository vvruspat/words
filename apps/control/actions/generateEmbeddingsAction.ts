"use server";

import type { Language } from "@vvruspat/words-types";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function generateEmbeddingsAction(
	language?: Language,
): Promise<{ queued: number }> {
	const url = new URL(`${apiBase}/word/generate-embeddings`);
	if (language) {
		url.searchParams.set("language", language);
	}
	const res = await fetch(url.toString(), { method: "POST" });
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to generate embeddings");
	}
	return res.json() as Promise<{ queued: number }>;
}
