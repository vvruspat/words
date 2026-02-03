"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function retranslateWordAction(wordId: number): Promise<boolean> {
	const res = await fetch(`${apiBase}/word/${wordId}/retranslate`, {
		method: "POST",
	});
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to retranslate word");
	}
	return true;
}
