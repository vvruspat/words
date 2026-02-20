"use client";

import {
	AVAILABLE_LANGUAGES,
	type Language,
	type Topic,
	type VocabCatalog,
} from "@vvruspat/words-types";
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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bulkDeleteWordsAction } from "@/actions/bulkDeleteWordsAction";
import { deleteWordAction } from "@/actions/deleteWordAction";
import { fetchCatalogsAction } from "@/actions/fetchCatalogsAction";
import { fetchTopicsAction } from "@/actions/fetchTopicsAction";
import { fetchTranslationsAction } from "@/actions/fetchTranslationsAction";
import { fetchWordsAction } from "@/actions/fetchWordsAction";
import { regenerateAudioAction } from "@/actions/regenerateAudioAction";
import { retranslateWordAction } from "@/actions/retranslateWordAction";
import { TranslationsDropdown } from "@/components/TranslationsDropdown/TranslationsDropdown";
import useModal, { MODALS } from "@/stores/useModal";
import { useTranslationsStore } from "@/stores/useTranslationsStore";
import { useWordsStore } from "@/stores/useWordsStore";
import styles from "./ManageWords.module.css";

interface ManageWordsProps {
	initialCatalogs: VocabCatalog[];
	initialTopics: Topic[];
}

export default function ManageWords({
	initialCatalogs,
	initialTopics,
}: ManageWordsProps) {
	const {
		language,
		selectedCatalog,
		selectedTopic,
		selectedStatus,
		catalogs,
		topics,
		words,
		pendingGenerationCount,
		pendingGenerationFilter,
		setLanguage,
		setSelectedStatus,
		setSelectedCatalog,
		setSelectedTopic,
		setCatalogs,
		setTopics,
		setWords,
		removeWords,
		connect,
		disconnect,
	} = useWordsStore();

	const { translations, setTranslations } = useTranslationsStore();

	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(50);

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

	const didSeedInitialRef = useRef(false);

	useEffect(() => {
		connect();
		return () => disconnect();
	}, [connect, disconnect]);

	useEffect(() => {
		if (didSeedInitialRef.current) return;
		didSeedInitialRef.current = true;

		if (catalogs.length === 0 && initialCatalogs.length > 0) {
			setCatalogs(initialCatalogs);
		}

		if (topics.length === 0 && initialTopics.length > 0) {
			setTopics(initialTopics);
		}
	}, [
		catalogs.length,
		initialCatalogs,
		initialTopics,
		setCatalogs,
		setTopics,
		topics.length,
	]);

	// Fetch catalogs (all languages)
	useEffect(() => {
		if (initialCatalogs.length > 0) return;
		fetchCatalogsAction()
			.then((data) => {
				setCatalogs(data.items);
			})
			.catch(() => setCatalogs([]));
	}, [initialCatalogs.length, setCatalogs]);

	// Fetch topics (all languages)
	useEffect(() => {
		if (initialTopics.length > 0) return;
		fetchTopicsAction()
			.then((data) => {
				setTopics(data.items);
			})
			.catch(() => setTopics([]));
	}, [setTopics, initialTopics.length]);

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

	const topicsByLanguage = useMemo(
		() => topics.filter((topic) => topic.language === language),
		[topics, language],
	);

	const catalogsByLanguage = useMemo(
		() => catalogs.filter((catalog) => catalog.language === language),
		[catalogs, language],
	);

	const topicsOptions: MSelectOption[] = useMemo(
		() => [
			{ key: "all", value: "All" },
			...topicsByLanguage.map((topic) => ({
				key: topic.id.toString(),
				value: (
					<MText mode="primary" style={{ textAlign: "left" }}>
						{topic.title}
					</MText>
				),
				justify: "space-between" as const,
				after: (
					<MBadge mode="info">
						<MText mode="secondary">{topic.wordsCount ?? 0}</MText>
					</MBadge>
				),
			})),
		],
		[topicsByLanguage],
	);

	const catalogsOptions: MSelectOption[] = useMemo(
		() => [
			{ key: "all", value: "All" },
			...catalogsByLanguage.map((catalog) => ({
				key: catalog.id.toString(),
				value: (
					<MText mode="primary" style={{ textAlign: "left" }}>
						{catalog.title}
					</MText>
				),
				justify: "space-between" as const,
				after: (
					<MBadge mode="info">
						<MText mode="secondary">{catalog.wordsCount ?? 0}</MText>
					</MBadge>
				),
			})),
		],
		[catalogsByLanguage],
	);

	const shouldShowSkeletons = useMemo(() => {
		if (pendingGenerationCount <= 0) return false;
		if (!pendingGenerationFilter) return true;
		if (pendingGenerationFilter.language !== language) return false;
		const currentCatalog =
			selectedCatalog && selectedCatalog !== "all"
				? Number(selectedCatalog)
				: null;
		const currentTopic =
			selectedTopic && selectedTopic !== "all" ? Number(selectedTopic) : null;
		if (currentCatalog && currentCatalog !== pendingGenerationFilter.catalog) {
			return false;
		}
		if (currentTopic && currentTopic !== pendingGenerationFilter.topic) {
			return false;
		}
		return true;
	}, [
		language,
		pendingGenerationCount,
		pendingGenerationFilter,
		selectedCatalog,
		selectedTopic,
	]);

	const skeletonRows = useMemo(() => {
		if (!shouldShowSkeletons) return [];
		const skeletonCount = Math.min(pendingGenerationCount, limit);
		return Array.from({ length: skeletonCount }, (_, index) => ({
			id: `pending-${index + 1}`,
			status: "processing",
			word: "loading",
			audio: "loading",
			transcribtion: "loading",
			meaning: "loading",
			catalog: "loading",
			topic: "loading",
			translations: "loading",
			actions: "loading",
			__skeleton: true,
		}));
	}, [limit, pendingGenerationCount, shouldShowSkeletons]);

	const rows = useMemo(
		() => [...skeletonRows, ...words.map((word) => ({ ...word }))],
		[skeletonRows, words],
	);

	const isSkeletonRow = (row: Record<string, unknown>) => "__skeleton" in row;

	const renderSkeleton = (width = "100%") => (
		<span className={styles.skeleton} style={{ width }} />
	);

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
			const data = await fetchWordsAction({
				language,
				catalog:
					selectedCatalog && selectedCatalog !== "all"
						? Number(selectedCatalog)
						: undefined,
				topic:
					selectedTopic && selectedTopic !== "all"
						? Number(selectedTopic)
						: undefined,
				offset,
				limit,
				sortBy: undefined,
				sortOrder: undefined,
				filters: selectedStatus === "all" ? {} : { status: selectedStatus },
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

	useEffect(() => {
		if (words.length === 0) return;
		setPendingRetranslate((prev) => {
			if (prev.size === 0) return prev;
			const next = new Set(prev);
			for (const id of prev) {
				const word = words.find((w) => w.id === id);
				if (!word || word.status === "processed") {
					next.delete(id);
				}
			}
			return next;
		});
		setPendingRegenerate((prev) => {
			if (prev.size === 0) return prev;
			const next = new Set(prev);
			for (const id of prev) {
				const word = words.find((w) => w.id === id);
				if (!word || word.status === "processed") {
					next.delete(id);
				}
			}
			return next;
		});
	}, [words]);

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
							{
								field: "id",
								label: "ID",
								renderCell: (value, row) =>
									isSkeletonRow(row)
										? renderSkeleton("40%")
										: value?.toString(),
							},
							{
								field: "status",
								label: "Status",
								renderCell: (status, row) =>
									isSkeletonRow(row) ? (
										renderSkeleton("60%")
									) : (
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
											{ key: "all", value: "All" },
											{ key: "processing", value: "Processing" },
											{ key: "processed", value: "Processed" },
										]}
										value={selectedStatus}
										onChange={(e) =>
											setSelectedStatus(
												e.target.value as "all" | "processing" | "processed",
											)
										}
									/>
								),
							},
							{
								field: "word",
								label: "Word",
								renderCell: (_value, row) =>
									isSkeletonRow(row)
										? renderSkeleton("80%")
										: _value?.toString(),
							},
							{
								field: "audio",
								label: "Audio",
								renderCell: (audio, row) =>
									isSkeletonRow(row) ? (
										<span className={styles.skeletonCircle} />
									) : audio ? (
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
								renderCell: (value, row) =>
									isSkeletonRow(row)
										? renderSkeleton("70%")
										: value?.toString(),
							},
							{
								field: "meaning",
								label: "Meaning",
								renderCell: (value, row) =>
									isSkeletonRow(row)
										? renderSkeleton("90%")
										: value?.toString(),
							},
							{
								field: "catalog",
								label: "Catalog",
								renderCell: (catalog, row) =>
									isSkeletonRow(row)
										? renderSkeleton("75%")
										: (catalogsByLanguage.find(
												(c) => Number(c.id) === Number(catalog),
											)?.title ?? ""),
								renderFilter: (props) => (
									<MSelect
										{...props}
										options={catalogsOptions}
										value={selectedCatalog || "all"}
										onChange={(e) => setSelectedCatalog(e.target.value)}
									/>
								),
							},
							{
								field: "topic",
								label: "Topic",
								renderCell: (topic, row) =>
									isSkeletonRow(row)
										? renderSkeleton("75%")
										: (topicsByLanguage.find(
												(t) => Number(t.id) === Number(topic),
											)?.title ?? ""),
								renderFilter: (props) => (
									<MSelect
										{...props}
										options={topicsOptions}
										value={selectedTopic || "all"}
										onChange={(e) => setSelectedTopic(e.target.value)}
									/>
								),
							},
							{
								field: "id",
								key: "translations",
								label: "Translations",
								renderCell: (id, row) =>
									isSkeletonRow(row) ? (
										renderSkeleton("85%")
									) : (
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
								renderCell: (id, row) =>
									isSkeletonRow(row) ? (
										<span className={styles.skeletonActions} />
									) : (
										<MFlex direction="row" gap="s" align="center">
											<MButton
												mode="tertiary"
												size="s"
												onClick={() => handleRetranslate(Number(id))}
												disabled={pendingRetranslate.has(Number(id))}
												title={
													pendingRetranslate.has(Number(id))
														? "Retranslating..."
														: "Retranslate"
												}
											>
												{pendingRetranslate.has(Number(id)) ? (
													<MIconArrowsClockwise
														mode="regular"
														width={16}
														height={16}
														className={styles.spin}
													/>
												) : (
													<MIconTranslate
														mode="regular"
														width={16}
														height={16}
													/>
												)}
											</MButton>
											<MButton
												mode="tertiary"
												size="s"
												onClick={() => handleRegenerateAudio(Number(id))}
												disabled={pendingRegenerate.has(Number(id))}
												title={
													pendingRegenerate.has(Number(id))
														? "Regenerating audio..."
														: "Regenerate audio"
												}
											>
												<MIconArrowsClockwise
													mode="regular"
													width={16}
													height={16}
													className={
														pendingRegenerate.has(Number(id))
															? styles.spin
															: undefined
													}
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
						rows={rows}
					/>
				)}
			</MFlex>
		</main>
	);
}
