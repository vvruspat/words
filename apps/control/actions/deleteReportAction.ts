"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function deleteReportAction(id: number): Promise<void> {
	const response = await fetchWordsApi(`/report/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error(`Failed to delete report: ${response.status}`);
	}
}
