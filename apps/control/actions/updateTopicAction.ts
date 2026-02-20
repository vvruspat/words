"use server";

import { Topic } from "@vvruspat/words-types";
import { $fetch } from "@/lib/fetch";

export const updateTopicAction = async (
	_initialState: Topic,
	formData: FormData,
) => {
	const id = Number(formData.get("id") as string);
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const language = formData.get("language") as string;

	return await $fetch("/topic", "put", {
		body: { id, title, description, language },
	});
};
