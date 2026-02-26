"use client";

import {
	MBadge,
	MButton,
	MCard,
	MDescriptionList,
	MFlex,
	MHeading,
	MIconArrowsClockwise,
	MIconPlay,
	MIconTranslate,
	MIconTrash,
	MIconX,
	MText,
} from "@repo/uikit";
import {
	AVAILABLE_LANGUAGES,
	type Language,
	type Topic,
	type VocabCatalog,
	type Word,
} from "@vvruspat/words-types";
import { useCallback, useEffect, useState } from "react";
import { deleteWordAction } from "@/actions/deleteWordAction";
import { fetchCatalogsAction } from "@/actions/fetchCatalogsAction";
import { fetchTopicsAction } from "@/actions/fetchTopicsAction";
import { fetchTranslationsAction } from "@/actions/fetchTranslationsAction";
import { fetchWordByIdAction } from "@/actions/fetchWordByIdAction";
import { regenerateAudioAction } from "@/actions/regenerateAudioAction";
import { retranslateWordAction } from "@/actions/retranslateWordAction";
import { updateWordAction } from "@/actions/updateWordAction";
import { TranslationsDropdown } from "@/components/TranslationsDropdown/TranslationsDropdown";
import { useTranslationsStore } from "@/stores/useTranslationsStore";
import styles from "./WordDetailModal.module.css";

type WordDetailModalProps = {
	wordId: number;
	onClose: () => void;
};

export function WordDetailModal({ wordId, onClose }: WordDetailModalProps) {
	const [word, setWord] = useState<Word | null>(null);
	const [catalogs, setCatalogs] = useState<VocabCatalog[]>([]);
	const [topics, setTopics] = useState<Topic[]>([]);
	const [loading, setLoading] = useState(true);
	const [editingWord, setEditingWord] = useState(false);
	const [pendingRetranslate, setPendingRetranslate] = useState(false);
	const [pendingRegenerate, setPendingRegenerate] = useState(false);
	const [pendingDelete, setPendingDelete] = useState(false);

	const { translations, setTranslations } = useTranslationsStore();

	useEffect(() => {
		setLoading(true);
		Promise.all([
			fetchWordByIdAction(wordId),
			fetchCatalogsAction(),
			fetchTopicsAction(),
		])
			.then(([wordData, catalogsData, topicsData]) => {
				setWord(wordData);
				setCatalogs(catalogsData.items);
				setTopics(topicsData.items);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, [wordId]);

	useEffect(() => {
		if (!word) return;
		fetchTranslationsAction({
			offset: 0,
			limit: Object.keys(AVAILABLE_LANGUAGES).length,
			words: [word.id],
		})
			.then((data) => setTranslations(data.items))
			.catch(() => {});
	}, [word, setTranslations]);

	const handleWordSave = useCallback(
		async (newValue: string) => {
			setEditingWord(false);
			if (!word || !newValue.trim() || newValue === word.word) return;
			const updated = await updateWordAction(word.id, newValue.trim());
			setWord((prev) => (prev ? { ...prev, ...updated } : prev));
		},
		[word],
	);

	const handleRetranslate = useCallback(async () => {
		if (!word) return;
		setPendingRetranslate(true);
		try {
			await retranslateWordAction(word.id);
		} finally {
			setPendingRetranslate(false);
		}
	}, [word]);

	const handleRegenerateAudio = useCallback(async () => {
		if (!word) return;
		setPendingRegenerate(true);
		try {
			await regenerateAudioAction(word.id);
		} finally {
			setPendingRegenerate(false);
		}
	}, [word]);

	const handleDelete = useCallback(async () => {
		if (!word) return;
		setPendingDelete(true);
		try {
			await deleteWordAction(word.id);
			onClose();
		} finally {
			setPendingDelete(false);
		}
	}, [word, onClose]);

	const handlePlayAudio = useCallback(() => {
		if (!word?.audio) return;
		const audio = new Audio(word.audio);
		void audio.play().catch(console.error);
	}, [word]);

	const catalogName = word
		? (catalogs.find((c) => c.id === word.catalog)?.title ?? `#${word.catalog}`)
		: "";
	const topicName = word
		? (topics.find((t) => t.id === word.topic)?.title ?? `#${word.topic}`)
		: "";

	return (
		<>
			<button type="button" className={styles.overlay} onClick={onClose} />
			<div className={styles.wrapper}>
				<MCard
					className={styles.modal}
					role="dialog"
					header={
						<MFlex direction="row" justify="space-between" align="center">
							<MFlex direction="row" gap="s" align="center">
								{word && (
									<MBadge mode="info">
										{AVAILABLE_LANGUAGES[word.language as Language] ??
											word.language}
									</MBadge>
								)}
								<MHeading mode="h3">{word?.word ?? `Word #${wordId}`}</MHeading>
							</MFlex>
							<MButton mode="transparent" onClick={onClose} aria-label="Close">
								<MIconX mode="regular" width={24} height={24} />
							</MButton>
						</MFlex>
					}
					footer={
						word ? (
							<MFlex
								direction="row"
								gap="s"
								justify="space-between"
								align="center"
							>
								<MFlex direction="row" gap="s">
									<MButton
										mode="tertiary"
										onClick={handleRetranslate}
										disabled={pendingRetranslate}
										title={
											pendingRetranslate ? "Retranslating..." : "Retranslate"
										}
										before={
											pendingRetranslate ? (
												<MIconArrowsClockwise
													mode="regular"
													width={16}
													height={16}
													className={styles.spin}
												/>
											) : (
												<MIconTranslate mode="regular" width={16} height={16} />
											)
										}
									>
										Retranslate
									</MButton>
									<MButton
										mode="tertiary"
										onClick={handleRegenerateAudio}
										disabled={pendingRegenerate}
										title={
											pendingRegenerate
												? "Regenerating audio..."
												: "Regenerate audio"
										}
										before={
											<MIconArrowsClockwise
												mode="regular"
												width={16}
												height={16}
												className={pendingRegenerate ? styles.spin : undefined}
											/>
										}
									>
										Regenerate Audio
									</MButton>
								</MFlex>
								<MFlex direction="row" gap="s">
									<MButton
										mode="secondary"
										onClick={handleDelete}
										disabled={pendingDelete}
										title="Delete word"
										before={
											<MIconTrash mode="regular" width={16} height={16} />
										}
									>
										Delete
									</MButton>
									<MButton mode="primary" onClick={onClose}>
										Close
									</MButton>
								</MFlex>
							</MFlex>
						) : null
					}
				>
					{loading && <MText mode="secondary">Loading word data...</MText>}
					{!loading && !word && <MText mode="secondary">Word not found.</MText>}
					{!loading && word && (
						<MDescriptionList
							size="m"
							options={[
								{
									title: "Word",
									description: editingWord ? (
										<input
											autoFocus
											className={styles.wordInput}
											defaultValue={word.word}
											onKeyDown={(e) => {
												if (e.key === "Enter")
													void handleWordSave(e.currentTarget.value);
												if (e.key === "Escape") setEditingWord(false);
											}}
											onBlur={(e) => void handleWordSave(e.target.value)}
										/>
									) : (
										<span
											className={styles.wordCell}
											onDoubleClick={() => setEditingWord(true)}
											title="Double-click to edit"
										>
											{word.word}
										</span>
									),
								},
								{
									title: "Translations",
									description: (
										<TranslationsDropdown
											id={word.id}
											translations={translations}
										/>
									),
								},
								{
									title: "Status",
									description: (
										<MBadge
											mode={
												word.status === "processing" ? "warning" : "success"
											}
										>
											{word.status}
										</MBadge>
									),
								},
								{
									title: "Audio",
									description: word.audio ? (
										<MButton mode="round" onClick={handlePlayAudio} size="m">
											<MIconPlay mode="regular" width={16} height={16} />
										</MButton>
									) : (
										<MText mode="tertiary">No audio</MText>
									),
								},
								...(word.transcribtion
									? [
											{
												title: "Transcription",
												description: word.transcribtion,
											},
										]
									: []),
								...(word.meaning
									? [{ title: "Meaning", description: word.meaning }]
									: []),
								{ title: "Catalog", description: catalogName },
								{ title: "Topic", description: topicName },
							]}
						/>
					)}
				</MCard>
			</div>
		</>
	);
}
