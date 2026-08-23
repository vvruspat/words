"use server";

import { $fetch } from "@/lib/fetch";

export type ReportStatsResponse = {
	new: number;
	reviewed: number;
	resolved: number;
	total: number;
};

export async function fetchReportStatsAction(): Promise<ReportStatsResponse> {
	return await $fetch("/report/stats", "get", {});
}
