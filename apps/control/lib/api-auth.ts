import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type WordsTokenResponse = {
	access_token: string;
};

export const apiServer = process.env.API_SERVER || "http://localhost:3000";

export const getWordsApiAuthorization = cache(async (): Promise<
	string | undefined
> => {
	const supabase = await createSupabaseServerClient();
	const { data, error } = await supabase.auth.getSession();

	if (error || !data.session?.access_token) {
		return undefined;
	}

	const response = await fetch(`${apiServer}/auth/supabase/exchange`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${data.session.access_token}`,
		},
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error(`Failed to exchange Supabase session: ${response.status}`);
	}

	const token = (await response.json()) as WordsTokenResponse;

	return `Bearer ${token.access_token}`;
});

export const fetchWordsApi = async (
	path: string,
	init: RequestInit = {},
): Promise<Response> => {
	const authorization = await getWordsApiAuthorization();
	const headers = new Headers(init.headers);

	if (authorization) {
		headers.set("Authorization", authorization);
	}

	return fetch(`${apiServer}${path}`, {
		...init,
		headers,
	});
};
