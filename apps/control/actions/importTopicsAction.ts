"use server";

import { $fetch } from "@/lib/fetch";

export const importTopicsAction = async (
	language: string,
	topics: Array<Record<string, string | number>>,
) => {
	return await $fetch("/import/topics", "post", {
		body: { language, topics },
	});
};
