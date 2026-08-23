import { headers } from "next/headers";

export const fetchJson = async <T,>(url: string): Promise<T> => {
	const headersList = await headers();
	const cookie = headersList.get("cookie");
	const res = await fetch(url, {
		cache: "no-store",
		headers: cookie ? { cookie } : undefined,
	});

	if (!res.ok) {
		throw new Error(`Request failed: ${res.status}`);
	}

	return res.json() as Promise<T>;
};
