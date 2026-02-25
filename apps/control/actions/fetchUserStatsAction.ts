"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export type UserStatsResponse = {
	total: number;
	emailVerified: number;
	recentCount: number;
	byLanguageLearn: Array<{ language: string; count: number }>;
};

export async function fetchUserStatsAction(): Promise<UserStatsResponse> {
	const res = await fetch(`${apiBase}/user/stats`, { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch user stats");
	return res.json() as Promise<UserStatsResponse>;
}
