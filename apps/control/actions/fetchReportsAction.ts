"use server";

import type { Report } from "@vvruspat/words-types";
import { getBaseUrl } from "@/lib/getBaseUrl";
import { fetchJson } from "@/lib/fetchJson";

export interface GetReportResponseDto {
	items: Report[];
	total: number;
	limit: number;
	offset: number;
}

export async function fetchReportsAction(props: {
	offset: number;
	limit: number;
	status?: Report["status"];
	word?: number;
}): Promise<GetReportResponseDto> {
	const baseUrl = await getBaseUrl();
	const params = new URLSearchParams();
	params.set("offset", String(props.offset));
	params.set("limit", String(props.limit));
	if (props.status) params.set("status", props.status);
	if (props.word) params.set("word", String(props.word));

	return fetchJson<GetReportResponseDto>(
		`${baseUrl}/api/report?${params.toString()}`,
	);
}
