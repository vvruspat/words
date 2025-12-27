"use server";

import { Language } from "@repo/types";
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
}) {
	const { filters, ...restProps } = props;
	return await $fetch("/word", "get", {
		query: {
			...restProps,
			...filters,
		},
	});
}
