import { GetVocabcatalogRequest, GetVocabcatalogResponse } from "@repo/types";
import { $fetch } from "@/lib/fetch";

export const getVocabCatalogAction = async (
	request: GetVocabcatalogRequest,
): Promise<GetVocabcatalogResponse> => {
	return $fetch("/vocabcatalog", "get", {
		query: {
			limit: request.limit ?? 10,
			offset: request.offset ?? 0,
			...Object.fromEntries(
				Object.entries(request).filter(
					([key]) => key !== "limit" && key !== "offset",
				),
			),
		},
	});
};
