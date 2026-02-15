import { fetchCatalogsAction } from "@/actions/fetchCatalogsAction";
import { fetchTopicsAction } from "@/actions/fetchTopicsAction";
import ManageWords from "@/components/ManageWords";

export default async function ManageWordsPage() {
	const [catalogsResult, topicsResult] = await Promise.allSettled([
		fetchCatalogsAction(),
		fetchTopicsAction(),
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
