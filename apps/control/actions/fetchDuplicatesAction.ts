"use server";

import type { WordData } from "@vvruspat/words-types";
import { fetchWordsApi } from "@/lib/api-auth";

export type DuplicateGroup = {
	word: string;
	language: string;
	items: WordData[];
};

export type GetWordDuplicatesResponse = {
	groups: DuplicateGroup[];
	total: number;
	limit: number;
	offset: number;
};

export async function fetchDuplicatesAction(props: {
	limit: number;
	offset: number;
	language?: string;
}): Promise<GetWordDuplicatesResponse> {
	const params = new URLSearchParams({
		limit: String(props.limit),
		offset: String(props.offset),
	});
	if (props.language) params.set("language", props.language);

	const response = await fetchWordsApi(`/word/duplicates?${params.toString()}`, {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch duplicates");
	}

	return response.json() as Promise<GetWordDuplicatesResponse>;
}
