"use server";

import { Topic } from "@repo/types";
import { $fetch } from "@/lib/fetch";

export const addTopicAction = async (
	_initialState: Partial<Topic>,
	formData: FormData,
) => {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const language = formData.get("language") as string;

	return await $fetch("/topic", "post", {
		body: {
			title,
			description,
			language,
		},
	});
};
