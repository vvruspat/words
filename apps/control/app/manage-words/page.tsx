"use client";
import { AVAILABLE_LANGUAGES, type Language, type Word } from "@repo/types";
import {
	MBadge,
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
import { fetchTranslationsAction } from "@/actions/fetchTranslationsAction";
import { TranslationsDropdown } from "@/components/TranslationsDropdown/TranslationsDropdown";
import useModal, { MODALS } from "@/stores/useModal";
import { useTranslationsStore } from "@/stores/useTranslationsStore";
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

	const { translations, setTranslations } = useTranslationsStore();

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
		fetchTopicsAction(language)
			.then((data) => {
				setTopics(data.items);
			})
			.catch(() => setTopics([]));
	}, [setTopics, language]);

	// Fetch translations using server action
	useEffect(() => {
		fetchTranslationsAction({
			offset: 0,
			limit: words.length * Object.keys(AVAILABLE_LANGUAGES).length,
			words: words.map((word) => word.id),
		})
			.then((data) => {
				setTranslations(data.items);
			})
			.catch(() => setTranslations([]));
	}, [setTranslations, words]);

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
					<MFlex direction="row" gap="s">
						<MButton
							mode="tertiary"
							onClick={() => showModal(MODALS.MANAGE_CATALOGS)}
						>
							Add Catalogs
						</MButton>

						<MButton
							mode="tertiary"
							onClick={() => showModal(MODALS.MANAGE_TOPICS)}
						>
							Add Topics
						</MButton>

						<MButton
							mode="primary"
							onClick={() => showModal(MODALS.GENERATE_WORDS)}
						>
							Generate Words
						</MButton>
					</MFlex>
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
								renderCell: (status) => (
									<MBadge
										mode={status === "processing" ? "warning" : "success"}
									>
										{status as "processing" | "processed"}
									</MBadge>
								),
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
							{
								field: "id",
								key: "translations",
								label: "Translations",
								renderCell: (id) => (
									<TranslationsDropdown
										id={Number(id)}
										translations={translations}
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
