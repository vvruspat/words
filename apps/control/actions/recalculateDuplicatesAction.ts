"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function recalculateDuplicatesAction(): Promise<{ queued: number }> {
	const res = await fetch(`${apiBase}/word/recalculate-duplicates`, {
		method: "POST",
	});
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to recalculate duplicates");
	}
	return res.json() as Promise<{ queued: number }>;
}
