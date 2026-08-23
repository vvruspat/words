"use server";

import { fetchWordsApi } from "@/lib/api-auth";

export async function deleteTopicTranslationAction(id: number) {
	const response = await fetchWordsApi(`/topic-translation/${id}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error(
			response.statusText || "Failed to delete topic translation",
		);
	}

	return response.json();
}
