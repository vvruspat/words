"use server";

import { VocabCatalog } from "@vvruspat/words-types";
import { $fetch } from "@/lib/fetch";

export const updateCatalogAction = async (
	_initialState: VocabCatalog,
	formData: FormData,
) => {
	const id = Number(formData.get("id") as string);
	const title = formData.get("title") as string;
	const description = formData.get("description") as string;
	const language = formData.get("language") as string;
	const owner = Number(formData.get("owner") as string);

	return await $fetch("/vocabcatalog", "put", {
		body: { id, title, description, language, owner },
	});
};
