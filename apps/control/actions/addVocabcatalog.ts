import { PostVocabCatalogRequest, PostVocabCatalogResponse } from "@repo/types";
import { $fetch } from "@/utils/fetch";

export const addVocabCatalogAction = async (
	_prevState: PostVocabCatalogResponse,
	formData: FormData,
): Promise<PostVocabCatalogResponse> => {
	// const owner = await auth().id;
	const owner = 0;

	const request: PostVocabCatalogRequest = {
		title: formData.get("name") as string,
		language: formData.get("language") as string,
		image: formData.get("image") as string | null,
		owner,
		description: formData.get("description") as string,
	};

	return $fetch<PostVocabCatalogRequest, PostVocabCatalogResponse>(
		"/vocabcatalog",
		"POST",
		request,
	);
};
