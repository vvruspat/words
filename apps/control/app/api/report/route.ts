import type { Report } from "@vvruspat/words-types";
import { NextResponse } from "next/server";

import { $fetch } from "@/lib/fetch";

const parseNumber = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const parseStatus = (value: string | null): Report["status"] | undefined => {
	if (value === "new" || value === "reviewed" || value === "resolved") {
		return value;
	}

	return undefined;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parseNumber(searchParams.get("offset"), 0);
	const limit = parseNumber(searchParams.get("limit"), 10);
	const status = parseStatus(searchParams.get("status"));
	const word = parseNumber(searchParams.get("word"), Number.NaN);

	const data = await $fetch("/report", "get", {
		query: {
			offset,
			limit,
			...(status ? { status } : {}),
			...(Number.isFinite(word) ? { word } : {}),
		},
	});
	return NextResponse.json(data);
}
