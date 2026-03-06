"use server";

import { TopicTranslation } from "@vvruspat/words-types";
import { $fetch } from "../lib/fetch";

export async function fetchTopicTranslationsAction(props: {
	offset: number;
	limit: number;
	topics?: TopicTranslation["topic"][];
}) {
	const { topics, offset = 0, limit = 1000 } = props;

	return await $fetch("/topic-translation", "get", {
		query: {
			topics: topics?.join(","),
			offset,
			limit,
		},
	});
}
