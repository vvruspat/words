import { MAlert, MDescriptionList, MFlex } from "@repo/uikit";
import { getVocabCatalogAction } from "@/actions/getVocabcatalog";

export default async function Vocabcatalog() {
	const data = await getVocabCatalogAction({
		limit: 10,
		offset: 0,
	});

	console.log("Response from getVocabCatalogAction:", data);

	// if (error instanceof Error) {
	// 	return (
	// 		<MAlert mode="error">
	// 			Error loading vocabulary catalog: {error.message}
	// 		</MAlert>
	// 	);
	// }

	if (data.items.length === 0) {
		return <MAlert mode="warning">No vocabulary catalog found.</MAlert>;
	}

	return (
		<MFlex direction="column" gap="2xl">
			{data.items.map((vocab) => {
				const options = [
					{ title: "ID", description: vocab.id },
					{ title: "Title", description: vocab.title },
					{ title: "Language", description: vocab.language },
					{
						title: "Created At",
						description: new Date(vocab.created_at).toLocaleDateString(),
					},
					{ title: "Owner", description: vocab.owner },
				];

				if (vocab.description) {
					options.push({
						title: "Description",
						description: vocab.description,
					});
				}

				return <MDescriptionList options={options} key={vocab.id} />;
			})}
		</MFlex>
	);
}
