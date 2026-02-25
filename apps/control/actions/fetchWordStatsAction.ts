"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

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
	const res = await fetch(`${apiBase}/word/stats`, { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch word stats");
	return res.json() as Promise<WordStatsResponse>;
}
