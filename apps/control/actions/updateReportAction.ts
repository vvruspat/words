"use server";

import type { Report } from "@vvruspat/words-types";

const server = process.env.API_SERVER;

export async function updateReportAction(
	id: number,
	status: Report["status"],
): Promise<Report> {
	const res = await fetch(`${server}/report`, {
		method: "PUT",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ id, status }),
	});

	if (!res.ok) {
		throw new Error(`Failed to update report: ${res.status}`);
	}

	return res.json() as Promise<Report>;
}
