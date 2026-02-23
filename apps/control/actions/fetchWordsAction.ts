"use server";

import { Language } from "@vvruspat/words-types";
import { $fetch } from "../lib/fetch";

export async function fetchWordsAction(props: {
	language?: Language;
	catalog?: number;
	topic?: number;
	offset: number;
	limit: number;
	filters: Record<string, string>;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	word?: string;
	translation?: string;
}) {
	const { filters, word, translation, ...restProps } = props;
	return await $fetch("/word", "get", {
		query: {
			...restProps,
			...filters,
			...(word ? { word } : {}),
			...(translation ? { translation } : {}),
		},
	});
}
