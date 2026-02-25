import { NextResponse } from "next/server";

const server = process.env.API_SERVER;

const parseNumber = (value: string | null, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const offset = parseNumber(searchParams.get("offset"), 0);
	const limit = parseNumber(searchParams.get("limit"), 10);
	const status = searchParams.get("status") ?? undefined;
	const word = searchParams.get("word") ?? undefined;

	const params = new URLSearchParams({
		offset: String(offset),
		limit: String(limit),
	});
	if (status) params.set("status", status);
	if (word) params.set("word", word);

	const res = await fetch(`${server}/report?${params.toString()}`, {
		cache: "no-store",
	});

	const data = await res.json();
	return NextResponse.json(data);
}
