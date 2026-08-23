"use server";

import type { Report } from "@vvruspat/words-types";
import { $fetch } from "@/lib/fetch";

export async function updateReportAction(
	id: number,
	status: Report["status"],
): Promise<Report> {
	return await $fetch("/report", "put", {
		body: { id, status },
	});
}
