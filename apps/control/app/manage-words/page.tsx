"use client";
import {
	AVAILABLE_LANGUAGES,
	type Language,
	type Topic,
	type VocabCatalog,
	type Word,
} from "@repo/types";
import {
	MButton,
	MDataGrid,
	MDivider,
	MFlex,
	MFormField,
	MHeading,
	MIconPlay,
	MSelect,
	type MSelectOption,
} from "@repo/uikit";

import { useCallback, useEffect, useRef, useState } from "react";

import { fetchCatalogsAction } from "../../actions/fetchCatalogsAction";
import { fetchTopicsAction } from "../../actions/fetchTopicsAction";
import { fetchWordsAction } from "../../actions/fetchWordsAction";
import { generateWordsAction } from "../../actions/generateWordsAction";

export default function ManageWordsPage() {
	const [language, setLanguage] = useState<Language>();
	const [catalogs, setCatalogs] = useState<VocabCatalog[]>([]);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [selectedCatalog, setSelectedCatalog] = useState<string>("");
	const [selectedTopic, setSelectedTopic] = useState<string>("");
	const [words, setWords] = useState<Word[]>([]);

	const [generateTopic, setGenerateTopic] = useState<number>();
	const [generateCatalog, setGenerateCatalog] = useState<number>();
	const [generating, setGenerating] = useState(false);
	const [generateMessage, setGenerateMessage] = useState("");

	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);
	const prevFiltersRef = useRef({
		language,
		selectedCatalog,
		selectedTopic,
	});

	const topicsOptions: MSelectOption[] = topics.map((topic) => ({
		key: topic.id.toString(),
		value: topic.title,
	}));

	const catalogsOptions: MSelectOption[] = catalogs.map((catalog) => ({
		key: catalog.id.toString(),
		value: catalog.title,
	}));

	// Fetch catalogs
	useEffect(() => {
		language &&
			fetchCatalogsAction(language)
				.then((data) => {
					setCatalogs(data.items);
				})
				.catch(() => setCatalogs([]));
	}, [language]);

	// Fetch topics using server action
	useEffect(() => {
		fetchTopicsAction()
			.then((data) => {
				setTopics(data.items);
			})
			.catch(() => setTopics([]));
	}, []);

	const languageOptions = Object.entries(AVAILABLE_LANGUAGES).map(
		([key, value]) => ({
			key,
			value,
		}),
	);

	// Fetch words when filters or pagination changes
	useEffect(() => {
		const prevFilters = prevFiltersRef.current;
		const filtersChanged =
			prevFilters.language !== language ||
			prevFilters.selectedCatalog !== selectedCatalog ||
			prevFilters.selectedTopic !== selectedTopic;

		// Reset to first page when filters change
		if (filtersChanged) {
			setOffset(0);
			prevFiltersRef.current = { language, selectedCatalog, selectedTopic };
		}

		const fetchWords = async () => {
			const data = await fetchWordsAction({
				language,
				catalog: selectedCatalog ? Number(selectedCatalog) : undefined,
				topic: selectedTopic ? Number(selectedTopic) : undefined,
				offset,
				limit,
				sortBy: undefined,
				sortOrder: undefined,
				filters: {},
			});

			setTotal(data.total);
			setWords(data.items);
		};
		void fetchWords();
	}, [language, selectedCatalog, selectedTopic, offset, limit]);

	const handleNextPage = useCallback((newOffset: number, newLimit: number) => {
		setOffset(newOffset);
		setLimit(newLimit);
	}, []);

	const handlePreviousPage = useCallback(
		(newOffset: number, newLimit: number) => {
			setOffset(newOffset);
			setLimit(newLimit);
		},
		[],
	);

	const handleRowsPerPageChange = useCallback((newLimit: number) => {
		setLimit(newLimit);
		setOffset(0); // Reset to first page when changing page size
	}, []);

	const handlePlayAudio = useCallback((audioUrl: string) => {
		if (!audioUrl) return;
		const audio = new Audio(audioUrl);
		void audio.play().catch((error) => {
			console.error("Error playing audio:", error);
		});
	}, []);

	return (
		<main style={{ padding: 24 }}>
			<MFlex gap="2xl" align="start" direction="column" justify="start">
				<MHeading mode="h1">Manage Words</MHeading>

				<MFormField
					label="Language"
					required
					direction="column"
					control={
						<MSelect
							name="language"
							options={languageOptions}
							value={language}
							onChange={(e) => setLanguage(e.target.value as Language)}
						/>
					}
				/>

				<MDivider />

				{language && (
					<MDataGrid
						headers={[
							{ field: "id", label: "ID" },
							{
								field: "status",
								label: "Status",
							},
							{ field: "word", label: "Word" },
							{
								field: "audio",
								label: "Audio",
								renderCell: (audio) =>
									audio ? (
										<MButton
											mode="round"
											onClick={() => handlePlayAudio(audio as string)}
											size="m"
										>
											<MIconPlay mode="regular" width={16} height={16} />
										</MButton>
									) : null,
							},
							{
								field: "transcribtion",
								label: "Transcription",
							},
							{
								field: "meaning",
								label: "Meaning",
							},
							{
								field: "catalog",
								label: "Catalog",
								renderCell: (catalog) =>
									catalogs.find((c) => Number(c.id) === Number(catalog))
										?.title ?? "",
								renderFilter: (props) => (
									<MSelect
										{...props}
										options={catalogsOptions}
										value={selectedCatalog}
										onChange={(e) => setSelectedCatalog(e.target.value)}
									/>
								),
							},
							{
								field: "topic",
								label: "Topic",
								renderCell: (topic) =>
									topics.find((t) => Number(t.id) === Number(topic))?.title ??
									"",
								renderFilter: (props) => (
									<MSelect
										{...props}
										options={topicsOptions}
										value={selectedTopic}
										onChange={(e) => setSelectedTopic(e.target.value)}
									/>
								),
							},
						]}
						pagination={{
							total: total,
							limit: limit,
							offset: offset,
							onNextPage: handleNextPage,
							onPreviousPage: handlePreviousPage,
							onRowsPerPageChange: handleRowsPerPageChange,
						}}
						rows={words.map((word) => ({
							...word,
						}))}
					/>
				)}

				{language && <MDivider />}

				<section>
					<MHeading mode="h2">Generate New Words</MHeading>
					<form
						onSubmit={async (e) => {
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
									generateTopic ? topics[generateTopic].title : "",
									generateCatalog ? catalogs[generateCatalog].title : "",
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
						}}
					>
						<div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
							<MFormField
								label="Catalog"
								control={
									<MSelect
										name="generateCatalog"
										options={catalogsOptions}
										value={generateCatalog}
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
										value={generateTopic}
										onChange={(e) => setGenerateTopic(Number(e.target.value))}
									/>
								}
							/>
						</div>
						<MButton
							type="submit"
							disabled={generating || !generateCatalog || !generateTopic}
						>
							{generating ? "Generating..." : "Generate Words"}
						</MButton>
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
				</section>
			</MFlex>
		</main>
	);
}
