import {
	MButton,
	MFlex,
	MFormField,
	MInput,
	MSelect,
	MSelectOption,
} from "@repo/uikit";
import { FormEvent, useEffect, useState } from "react";
import { generateWordsAction } from "@/actions/generateWordsAction";
import { useWordsStore } from "@/stores/useWordsStore";

export const GenerateWordsForm = () => {
	const [generateTopic, setGenerateTopic] = useState<number>();
	const [generateCatalog, setGenerateCatalog] = useState<number>();
	const [generating, setGenerating] = useState(false);
	const [generateMessage, setGenerateMessage] = useState("");
	const [generateLimit, setGenerateLimit] = useState(20);

	const { language, topics, catalogs, selectedCatalog, selectedTopic } =
		useWordsStore();

	const topicsOptions: MSelectOption[] = topics.map((topic) => ({
		key: topic.id.toString(),
		value: topic.title,
	}));

	const catalogsOptions: MSelectOption[] = catalogs.map((catalog) => ({
		key: catalog.id.toString(),
		value: catalog.title,
	}));

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!language) {
			setGenerateMessage("Please select a language");
			return;
		}
		setGenerating(true);
		setGenerateMessage("");
		try {
			await generateWordsAction(
				language,
				topics.find((t) => t.id === generateTopic)?.title ?? "",
				catalogs.find((c) => c.id === generateCatalog)?.title ?? "",
				generateLimit,
			);
			setGenerateMessage("Word generation started!");
		} catch (err) {
			if (err instanceof Error) {
				setGenerateMessage(err.message ?? "Failed to generate words");
			} else {
				setGenerateMessage("Failed to generate words");
			}
		}
		setGenerating(false);
	};

	useEffect(() => {
		selectedTopic && setGenerateTopic(Number(selectedTopic));
	}, [selectedTopic]);

	useEffect(() => {
		selectedCatalog && setGenerateCatalog(Number(selectedCatalog));
	}, [selectedCatalog]);

	return (
		<form onSubmit={onSubmit}>
			<MFlex direction="column" gap="2xl" align="start" justify="start">
				<MFormField
					label="Catalog"
					control={
						<MSelect
							name="generateCatalog"
							options={catalogsOptions}
							value={generateCatalog?.toString()}
							onChange={(e) => setGenerateCatalog(Number(e.target.value))}
						/>
					}
				/>
				<MFormField
					label="Topic"
					control={
						<MSelect
							name="generateTopic"
							options={topicsOptions}
							value={generateTopic?.toString()}
							onChange={(e) => setGenerateTopic(Number(e.target.value))}
						/>
					}
				/>

				<MFormField
					label="Limit"
					description="The number of words to generate"
					control={
						<MInput
							type="number"
							name="generateLimit"
							value={generateLimit}
							onChange={(e) => setGenerateLimit(Number(e.target.value))}
						/>
					}
				/>

				<MButton
					type="submit"
					disabled={generating || !generateCatalog || !generateTopic}
				>
					{generating ? "Generating..." : "Generate Words"}
				</MButton>
			</MFlex>
			{generateMessage && (
				<div
					style={{
						marginTop: 12,
						color: generateMessage.includes("started") ? "green" : "red",
					}}
				>
					{generateMessage}
				</div>
			)}
		</form>
	);
};
