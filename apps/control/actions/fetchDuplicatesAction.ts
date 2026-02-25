"use server";

import type { WordData } from "@vvruspat/words-types";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

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

	const res = await fetch(`${apiBase}/word/duplicates?${params.toString()}`, {
		cache: "no-store",
	});
	if (!res.ok) throw new Error("Failed to fetch duplicates");
	return res.json() as Promise<GetWordDuplicatesResponse>;
}
