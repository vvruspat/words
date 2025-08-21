import { GetVocabCatalogRequest, GetVocabCatalogResponse } from "@repo/types";
import { $fetch } from "@/utils/fetch";

export const getVocabCatalogAction = async (
	request: GetVocabCatalogRequest = {},
): Promise<GetVocabCatalogResponse> => {
	return $fetch<GetVocabCatalogRequest, GetVocabCatalogResponse>(
		"/vocabcatalog",
		"GET",
		{
			limit: request.limit ?? 10,
			offset: request.offset ?? 0,
			...Object.fromEntries(
				Object.entries(request).filter(
					([key]) => key !== "limit" && key !== "offset",
				),
			),
		},
	);
};
