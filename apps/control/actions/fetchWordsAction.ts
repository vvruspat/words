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
	hasSymbols?: boolean;
}) {
	const { filters, word, translation, hasSymbols, ...restProps } = props;
	return await $fetch("/word", "get", {
		query: {
			...restProps,
			...filters,
			...(word ? { word } : {}),
			...(translation ? { translation } : {}),
			...(hasSymbols ? { hasSymbols: true } : {}),
		},
	});
}
