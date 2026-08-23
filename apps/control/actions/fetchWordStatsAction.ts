"use server";

import { $fetch } from "@/lib/fetch";

export type WordStatEntry = {
	language: string;
	catalogId: number | null;
	catalogTitle: string | null;
	count: number;
};

export type DuplicateStatEntry = {
	language: string;
	count: number;
};

export type WordStatsResponse = {
	wordsByLanguageCatalog: WordStatEntry[];
	duplicatesByLanguage: DuplicateStatEntry[];
};

export async function fetchWordStatsAction(): Promise<WordStatsResponse> {
	return await $fetch("/word/stats", "get", {});
}
