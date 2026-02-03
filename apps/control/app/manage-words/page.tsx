"use client";
import { AVAILABLE_LANGUAGES, type Language } from "@repo/types";
import {
	MBadge,
	MButton,
	MDataGrid,
	MFlex,
	MFormField,
	MHeading,
	MIconArrowsClockwise,
	MIconInfo,
	MIconPlay,
	MIconTranslate,
	MIconTrash,
	MSelect,
	type MSelectOption,
	MText,
} from "@repo/uikit";

import { useCallback, useEffect, useRef, useState } from "react";
import { bulkDeleteWordsAction } from "@/actions/bulkDeleteWordsAction";
import { deleteWordAction } from "@/actions/deleteWordAction";
import { fetchTranslationsAction } from "@/actions/fetchTranslationsAction";
import { regenerateAudioAction } from "@/actions/regenerateAudioAction";
import { retranslateWordAction } from "@/actions/retranslateWordAction";
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
		words,
		setLanguage,
		setSelectedCatalog,
		setSelectedTopic,
		setCatalogs,
		setTopics,
		setWords,
		removeWords,
	} = useWordsStore();

	const { translations, setTranslations } = useTranslationsStore();

	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(50);

	const [selectedStatus, setSelectedStatus] = useState<
		"processing" | "processed"
	>("processing");

	const [selectedRows, setSelectedRows] = useState<
		Array<{ id: number; [key: string]: unknown }>
	>([]);

	const { showModal } = useModal();

	const prevFiltersRef = useRef({
		language,
		selectedCatalog,
		selectedTopic,
		selectedStatus,
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
			prevFilters.selectedTopic !== selectedTopic ||
			prevFilters.selectedStatus !== selectedStatus;

		// Reset to first page when filters change
		if (filtersChanged) {
			setOffset(0);
			prevFiltersRef.current = {
				language,
				selectedCatalog,
				selectedTopic,
				selectedStatus,
			};
		}

		const fetchWords = async () => {
			console.log("-------fetchWords-------", {
				language,
				catalog: selectedCatalog ? Number(selectedCatalog) : undefined,
				topic: selectedTopic ? Number(selectedTopic) : undefined,
				offset,
				limit,
				sortBy: undefined,
				sortOrder: undefined,
				filters: { status: selectedStatus },
			});
			const data = await fetchWordsAction({
				language,
				catalog: selectedCatalog ? Number(selectedCatalog) : undefined,
				topic: selectedTopic ? Number(selectedTopic) : undefined,
				offset,
				limit,
				sortBy: undefined,
				sortOrder: undefined,
				filters: { status: selectedStatus },
			});

			setTotal(data.total);
			setWords(data.items);
		};
		void fetchWords();
	}, [
		language,
		selectedCatalog,
		selectedTopic,
		selectedStatus,
		offset,
		limit,
		setWords,
	]);

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

	const [pendingRetranslate, setPendingRetranslate] = useState<Set<number>>(
		new Set(),
	);
	const [pendingRegenerate, setPendingRegenerate] = useState<Set<number>>(
		new Set(),
	);

	const handleRetranslate = useCallback(async (wordId: number) => {
		setPendingRetranslate((prev) => new Set(prev).add(wordId));
		try {
			await retranslateWordAction(wordId);
		} finally {
			setPendingRetranslate((prev) => {
				const next = new Set(prev);
				next.delete(wordId);
				return next;
			});
		}
	}, []);

	const handleRegenerateAudio = useCallback(async (wordId: number) => {
		setPendingRegenerate((prev) => new Set(prev).add(wordId));
		try {
			await regenerateAudioAction(wordId);
		} finally {
			setPendingRegenerate((prev) => {
				const next = new Set(prev);
				next.delete(wordId);
				return next;
			});
		}
	}, []);

	const [pendingDelete, setPendingDelete] = useState<Set<number>>(new Set());

	const handleDelete = useCallback(
		async (wordId: number) => {
			setPendingDelete((prev) => new Set(prev).add(wordId));
			try {
				await deleteWordAction(wordId);
				removeWords([wordId]);
				setTotal((prev) => Math.max(0, prev - 1));
				setSelectedRows((prev) => prev.filter((r) => r.id !== wordId));
			} finally {
				setPendingDelete((prev) => {
					const next = new Set(prev);
					next.delete(wordId);
					return next;
				});
			}
		},
		[removeWords],
	);

	const handleBulkDelete = useCallback(async () => {
		const ids = selectedRows.map((r) => r.id);
		if (ids.length === 0) return;
		try {
			await bulkDeleteWordsAction(ids);
			removeWords(ids);
			setTotal((prev) => Math.max(0, prev - ids.length));
			setSelectedRows([]);
		} catch (error) {
			console.error("Bulk delete failed:", error);
			throw error;
		}
	}, [selectedRows, removeWords]);

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

						{selectedRows.length > 0 && (
							<MButton
								mode="secondary"
								onClick={handleBulkDelete}
								title={`Delete ${selectedRows.length} selected`}
							>
								<MIconTrash mode="regular" width={16} height={16} />
								Delete ({selectedRows.length})
							</MButton>
						)}

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
								renderFilter: (props) => (
									<MSelect
										{...props}
										options={[
											{ key: "processing", value: "Processing" },
											{ key: "processed", value: "Processed" },
										]}
										value={selectedStatus}
										onChange={(e) =>
											setSelectedStatus(
												e.target.value as "processing" | "processed",
											)
										}
									/>
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
							{
								field: "id",
								key: "actions",
								label: "Actions",
								renderCell: (id) => (
									<MFlex direction="row" gap="s" align="center">
										<MButton
											mode="tertiary"
											size="s"
											onClick={() => handleRetranslate(Number(id))}
											disabled={pendingRetranslate.has(Number(id))}
											title="Retranslate"
										>
											<MIconTranslate mode="regular" width={16} height={16} />
										</MButton>
										<MButton
											mode="tertiary"
											size="s"
											onClick={() => handleRegenerateAudio(Number(id))}
											disabled={pendingRegenerate.has(Number(id))}
											title="Regenerate audio"
										>
											<MIconArrowsClockwise
												mode="regular"
												width={16}
												height={16}
											/>
										</MButton>
										<MButton
											mode="tertiary"
											size="s"
											onClick={() => handleDelete(Number(id))}
											disabled={pendingDelete.has(Number(id))}
											title="Delete"
										>
											<MIconTrash mode="regular" width={16} height={16} />
										</MButton>
									</MFlex>
								),
							},
						]}
						onSelect={(selected) =>
							queueMicrotask(() =>
								setSelectedRows(
									selected as Array<{ id: number; [key: string]: unknown }>,
								),
							)
						}
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
