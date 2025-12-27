"use client";
import { AVAILABLE_LANGUAGES, type Language, type Word } from "@repo/types";
import {
	MButton,
	MDataGrid,
	MFlex,
	MFormField,
	MHeading,
	MIconInfo,
	MIconPlay,
	MSelect,
	type MSelectOption,
	MText,
} from "@repo/uikit";

import { useCallback, useEffect, useRef, useState } from "react";
import useModal, { MODALS } from "@/stores/useModal";
import { useWordsStore } from "@/stores/useWordsStore";
import { fetchCatalogsAction } from "../../actions/fetchCatalogsAction";
import { fetchTopicsAction } from "../../actions/fetchTopicsAction";
import { fetchWordsAction } from "../../actions/fetchWordsAction";

export default function ManageWordsPage() {
	const {
		language,
		selectedCatalog,
		selectedTopic,
		catalogs,
		topics,
		setLanguage,
		setSelectedCatalog,
		setSelectedTopic,
		setCatalogs,
		setTopics,
	} = useWordsStore();
	const [words, setWords] = useState<Word[]>([]);

	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(10);

	const { showModal } = useModal();

	const prevFiltersRef = useRef({
		language,
		selectedCatalog,
		selectedTopic,
	});

	// Fetch catalogs
	useEffect(() => {
		language &&
			fetchCatalogsAction(language)
				.then((data) => {
					setCatalogs(data.items);
				})
				.catch(() => setCatalogs([]));
	}, [language, setCatalogs]);

	// Fetch topics using server action
	useEffect(() => {
		fetchTopicsAction()
			.then((data) => {
				setTopics(data.items);
			})
			.catch(() => setTopics([]));
	}, [setTopics]);

	const languageOptions = Object.entries(AVAILABLE_LANGUAGES).map(
		([key, value]) => ({
			key,
			value,
		}),
	);

	const topicsOptions: MSelectOption[] = topics.map((topic) => ({
		key: topic.id.toString(),
		value: topic.title,
	}));

	const catalogsOptions: MSelectOption[] = catalogs.map((catalog) => ({
		key: catalog.id.toString(),
		value: catalog.title,
	}));

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
		<main
			style={{
				width: "100%",
				minHeight: "100vh",
				padding: "24px",
				boxSizing: "border-box",
			}}
		>
			<MFlex gap="2xl" align="start" direction="column" justify="start">
				<MHeading mode="h1">Manage Words</MHeading>

				<MFlex
					gap="2xl"
					align="end"
					direction="row"
					justify="space-between"
					style={{ width: "100%" }}
				>
					<div>
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
					</div>
					<div>
						<MButton
							mode="primary"
							onClick={() => showModal(MODALS.GENERATE_WORDS)}
						>
							Generate Words
						</MButton>
					</div>
				</MFlex>

				{language && (
					<MDataGrid
						width="100%"
						emptyMessage={
							<MFlex
								direction="column"
								align="center"
								justify="center"
								style={{ padding: "24px" }}
							>
								<MIconInfo mode="regular" width={24} height={24} />
								<MText>No words found</MText>
								<MButton
									mode="primary"
									onClick={() => showModal(MODALS.GENERATE_WORDS)}
								>
									Generate Words
								</MButton>
							</MFlex>
						}
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
			</MFlex>
		</main>
	);
}
