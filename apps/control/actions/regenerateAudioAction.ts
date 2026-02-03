"use server";

const apiBase = process.env.API_SERVER || "http://localhost:3000";

export async function regenerateAudioAction(wordId: number): Promise<boolean> {
	const res = await fetch(`${apiBase}/word/${wordId}/regenerate-audio`, {
		method: "POST",
	});
	if (!res.ok) {
		throw new Error(res.statusText || "Failed to regenerate audio");
	}
	return true;
}
