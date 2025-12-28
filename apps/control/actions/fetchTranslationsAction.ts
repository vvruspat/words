"use server";

import { WordTranslation } from "@repo/types";
import { $fetch } from "../lib/fetch";

export async function fetchTranslationsAction(props: {
	offset: number;
	limit: number;
	words?: WordTranslation["word"][];
}) {
	const { words, offset = 0, limit = 1000 } = props;

	return await $fetch("/words-translation", "get", {
		query: {
			words: words?.join(","),
			offset,
			limit,
		},
	});
}
