"use server";

import { $fetch } from "@/lib/fetch";

export type UserStatsResponse = {
	total: number;
	emailVerified: number;
	recentCount: number;
	byLanguageLearn: Array<{ language: string; count: number }>;
};

export async function fetchUserStatsAction(): Promise<UserStatsResponse> {
	return await $fetch("/user/stats", "get", {});
}
