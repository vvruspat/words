"use server";

import { VocabCatalog } from "@vvruspat/words-types";
import { $fetch } from "@/lib/fetch";

export const addCatalogAction = async (
	_initialState: Partial<VocabCatalog>,
	formData: FormData,
) => {
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const language = formData.get("language") as string;
	const owner = Number(formData.get("owner") as string);

	return await $fetch("/vocabcatalog", "post", {
		body: { title, description, language, owner },
	});
};
