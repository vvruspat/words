"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export type ReportStatsResponse = {
	new: number;
	reviewed: number;
	resolved: number;
	total: number;
};

export async function fetchReportStatsAction(): Promise<ReportStatsResponse> {
	const res = await fetch(`${apiBase}/report/stats`, { cache: "no-store" });
	if (!res.ok) throw new Error("Failed to fetch report stats");
	return res.json() as Promise<ReportStatsResponse>;
}
