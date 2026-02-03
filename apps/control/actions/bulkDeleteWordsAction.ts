"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function bulkDeleteWordsAction(
	wordIds: number[],
): Promise<{ deleted: number }> {
	if (wordIds.length === 0) return { deleted: 0 };

	const res = await fetch(`${apiBase}/word/bulk-delete`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ids: wordIds }),
	});
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to delete words");
	}
	return res.json();
}
