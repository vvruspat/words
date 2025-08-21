import { PutVocabCatalogRequest, PutVocabCatalogResponse } from "@repo/types";
import { $fetch } from "@/utils/fetch";

export const updateVocabCatalogAction = async (
	_prevState: PutVocabCatalogResponse,
	formData: FormData,
): Promise<PutVocabCatalogResponse> => {
	// const owner = await auth().id;
	const owner = 0;

	const request: PutVocabCatalogRequest = {
		id: Number(formData.get("id") as string),
		title: formData.get("name") as string,
		language: formData.get("language") as string,
		image: formData.get("image") as string | null,
		owner,
		description: formData.get("description") as string,
	};

	return $fetch<PutVocabCatalogRequest, PutVocabCatalogResponse>(
		"/vocabcatalog",
		"POST",
		request,
	);
};
