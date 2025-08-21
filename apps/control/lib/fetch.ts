import type { ApiResponseError, paths as Paths } from "@repo/types";
import { genericErrorMessage } from "./genericErrorMessage";
// import { auth } from "~/auth";
import logger from "./logger";

const server = process.env.API_SERVER;

type ValidUrl = keyof Paths;
type ValidMethod<U extends ValidUrl> = keyof Paths[U];

type SuccessCodes = 200 | 201;

type RequestBody<
	U extends ValidUrl,
	M extends ValidMethod<U>,
> = Paths[U][M] extends {
	requestBody: { content: { "application/json": infer Body } };
}
	? Body
	: Paths[U][M] extends {
				requestBody: { content: { "application/octet-stream": string } };
			}
		? File
		: undefined;

type QueryParams<
	U extends ValidUrl,
	M extends ValidMethod<U>,
> = Paths[U][M] extends { parameters: { query: infer Query } }
	? Query
	: undefined;

type PathParams<
	U extends ValidUrl,
	M extends ValidMethod<U>,
> = Paths[U][M] extends { parameters: { path: infer Params } }
	? Params
	: undefined;

type ResponsesByStatus<R, StatusPattern extends string | number> = R extends {
	[code: string]: unknown;
} // Ensure R is an object with string keys
	? {
			// Map over each status code (key) in the Responses object R
			[Code in keyof R]: Code extends StatusPattern // Check if the code matches the desired pattern (e.g., '2xx')
				? R[Code] extends { content: { "application/json": infer Body } } // If it matches, try to extract the JSON body type
					? Body // Return the extracted body type
					: never // If no 'application/json' content, return never
				: never; // If the status code doesn't match the pattern, return never
		}[keyof R] // Create a union of all the extracted Body types (or never)
	: never; // R was not a valid Responses object

// Extracts a union of JSON response bodies ONLY for 2xx status codes
type SuccessJsonResponse<
	U extends keyof Paths,
	M extends keyof Paths[U],
> = Paths[U][M] extends { responses: infer R } // Get the 'responses' object for the path/method
	? ResponsesByStatus<R, Extract<keyof R, SuccessCodes>> // Use the helper to filter for codes starting with '2'
	: never; // No 'responses' defined for this path/method

export const $fetch = async <U extends ValidUrl, M extends ValidMethod<U>>(
	url: U,
	method: M,
	options: {
		headers?: Record<string, string>;
		body?: RequestBody<U, M>;
		params?: PathParams<U, M>;
		query?: QueryParams<U, M>;
		noAuth?: boolean;
	},
): Promise<SuccessJsonResponse<U, M> | ApiResponseError> => {
	try {
		const { body, query, headers } = options;

		const isServer = typeof window === "undefined";

		const queryString = query
			? `?${new URLSearchParams(query as Record<string, string>).toString()}`
			: "";

		const authHeader: {
			Authorization?: string;
		} = {};

		const contentTypeHeader: {
			"content-type"?: string;
		} = {};

		if (headers?.["content-type"]) {
			contentTypeHeader["content-type"] = headers["content-type"];
		} else if (body) {
			contentTypeHeader["content-type"] = "application/json";
		}

		// if (isServer) {
		// 	const session = await auth();

		// 	const token = session?.sessionToken;

		// 	if (token && !options.noAuth) {
		// 		authHeader.Authorization = `Bearer ${token}`;
		// 	}
		// }

		let urlWithParams: string = url;

		if (options.params) {
			Object.entries(options.params).forEach(([key, value]) => {
				urlWithParams = urlWithParams.replace(`{${key}}`, String(value));
			});
		}

		const isOctetStream =
			contentTypeHeader["content-type"] === "application/octet-stream";

		const res = await fetch(
			`${isServer ? server : "/api"}${String(urlWithParams)}${queryString}`,
			{
				method: method as string,
				headers: {
					...contentTypeHeader,
					...authHeader,
					...headers,
				},
				body: body
					? isOctetStream
						? (body as unknown as File)
						: JSON.stringify(body)
					: undefined,
			},
		);

		const bodyInfo = body ? `Body: ${JSON.stringify(body)}` : "";
		const logMsg = `$fetch: ${method as string} ${urlWithParams}, Status: ${res.status} ${bodyInfo}`;

		if (res.status >= 400) logger.error(logMsg);
		else if (res.status >= 300) logger.warn(logMsg);
		else logger.info(logMsg);

		const textResponse = await res.text();

		if (res.status >= 400) {
			logger.error(
				`Error response from ${method as string} ${urlWithParams}: ${textResponse}`,
			);
		}

		if (!res.ok) {
			// Fail response
			try {
				return {
					message: res.statusText || genericErrorMessage(res.status),
				};
			} catch (error) {
				return {
					message:
						(error as Error).message ??
						(res.statusText || genericErrorMessage(res.status)),
				};
			}
		}

		// Success response
		return (
			res.headers.get("content-type")?.includes("application/json")
				? JSON.parse(textResponse)
				: undefined
		) as SuccessJsonResponse<U, M>;
	} catch (error) {
		return {
			message: (error as Error).message ?? "Internal Server Error",
		};
	}
};
