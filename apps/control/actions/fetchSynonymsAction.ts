"use server";

import type { WordData } from "@vvruspat/words-types";
import { fetchWordsApi } from "@/lib/api-auth";

export type SynonymGroup = {
	word: string;
	language: string;
	items: WordData[];
};

export type GetWordSynonymsResponse = {
	groups: SynonymGroup[];
	total: number;
	limit: number;
	offset: number;
};

export async function fetchSynonymsAction(props: {
	limit: number;
	offset: number;
	language?: string;
}): Promise<GetWordSynonymsResponse> {
	const params = new URLSearchParams({
		limit: String(props.limit),
		offset: String(props.offset),
	});
	if (props.language) params.set("language", props.language);

	const response = await fetchWordsApi(`/word/synonyms?${params.toString()}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch synonyms");
	}

	return response.json() as Promise<GetWordSynonymsResponse>;
}
