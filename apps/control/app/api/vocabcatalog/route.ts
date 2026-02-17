import { NextResponse } from "next/server";

import { $fetch } from "@/lib/fetch";

const parseNumber = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parseNumber(searchParams.get("offset"), 0);
	const limit = parseNumber(searchParams.get("limit"), 100);
	const language = searchParams.get("language") ?? undefined;

	const data = await $fetch("/vocabcatalog", "get", {
		query: {
			offset,
			limit,
			...(language ? { language } : {}),
		},
	});

	return NextResponse.json(data);
}
