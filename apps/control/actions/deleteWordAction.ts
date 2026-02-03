"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function deleteWordAction(wordId: number): Promise<boolean> {
	const res = await fetch(`${apiBase}/word/${wordId}`, {
		method: "DELETE",
	});
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to delete word");
	}
	return true;
}
