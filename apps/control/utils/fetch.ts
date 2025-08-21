import { ApiResponse, ApiResponseStatus } from "@repo/types";

export async function $fetch<RequestType, ResponseType extends ApiResponse>(
	url: string,
	method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
	data?: RequestType,
	options: RequestInit = {},
): Promise<ResponseType | ApiResponse> {
	const { headers, ...restOptions } = options;

	let body: string | undefined;
	let queryParams: string | undefined;

	const mergedHeaders = {
		"Content-Type": "application/json",
		...(headers || {}),
	};

	if (data) {
		if (method !== "GET" && method !== "DELETE") {
			body = JSON.stringify(data);
		} else {
			queryParams = new URLSearchParams(
				data as Record<string, string>,
			).toString();
			url += `?${queryParams}`;
		}
	}

	const fetchOptions: RequestInit = {
		...restOptions,
		method,
		headers: mergedHeaders,
		body,
	};

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		const errorResponse = {
			status: ApiResponseStatus.ERROR,
			error: {
				message: `Fetch error: ${response.status} ${response.statusText}`,
				status: response.status,
			},
		};

		return Promise.resolve(errorResponse);
	}

	return response.json() as Promise<ResponseType>;
}
