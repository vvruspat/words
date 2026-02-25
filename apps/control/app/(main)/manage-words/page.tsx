import type { components } from "@vvruspat/words-types";

import ManageWords from "@/components/ManageWords";
import { fetchJson } from "@/lib/fetchJson";
import { getBaseUrl } from "@/lib/getBaseUrl";

type GetVocabCatalogResponseDto =
	components["schemas"]["GetVocabCatalogResponseDto"];
type GetTopicResponseDto = components["schemas"]["GetTopicResponseDto"];

export default async function ManageWordsPage() {
	const baseUrl = await getBaseUrl();
	const [catalogsResult, topicsResult] = await Promise.allSettled([
		fetchJson<GetVocabCatalogResponseDto>(
			`${baseUrl}/api/vocabcatalog?offset=0&limit=100`,
		),
		fetchJson<GetTopicResponseDto>(`${baseUrl}/api/topic?offset=0&limit=100`),
	]);

	const initialCatalogs =
		catalogsResult.status === "fulfilled" ? catalogsResult.value.items : [];
	const initialTopics =
		topicsResult.status === "fulfilled" ? topicsResult.value.items : [];

	return (
		<ManageWords
			initialCatalogs={initialCatalogs}
			initialTopics={initialTopics}
		/>
	);
}
