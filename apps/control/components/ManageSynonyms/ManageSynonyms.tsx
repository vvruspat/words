"use client";

import {
	MBadge,
	MButton,
	MFlex,
	MGrid,
	MHeading,
	MIconCaretDown,
	MSelect,
	MText,
} from "@repo/uikit";
import { AVAILABLE_LANGUAGES, type Language } from "@vvruspat/words-types";
import { Fragment, useCallback, useEffect, useState } from "react";
import {
	type SynonymGroup,
	fetchSynonymsAction,
} from "@/actions/fetchSynonymsAction";
import styles from "../ManageDuplicates/ManageDuplicates.module.css";

const LIMIT = 20;

const languageOptions = [
	{ key: "all", value: "All languages" },
	...Object.entries(AVAILABLE_LANGUAGES).map(([key, value]) => ({
		key,
		value: value as string,
	})),
];

function SynonymGroupRow({ group }: { group: SynonymGroup }) {
	const [open, setOpen] = useState(false);

	return (
		<div className={styles.group}>
			<div
				className={styles.groupHeader}
				onClick={() => setOpen((v) => !v)}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
			>
				<div className={styles.groupTitle}>
					<MText mode="primary" size="m">
						<strong>{group.word}</strong>
					</MText>
					<MBadge mode="info">
						<MText mode="secondary" size="xs">
							{AVAILABLE_LANGUAGES[group.language as Language] ??
								group.language}
						</MText>
					</MBadge>
					<MBadge mode="success">
						<MText mode="secondary" size="xs">
							{group.items.length} synonyms
						</MText>
					</MBadge>
				</div>
				<MIconCaretDown
					mode="regular"
					width={16}
					height={16}
					className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
				/>
			</div>

			{open && (
				<MGrid
					columnTemplate="max-content 1fr max-content 1fr 1fr 2fr max-content"
					columnGap="m"
					rowGap="s"
					alignItems="center"
					className={styles.subList}
				>
					<MText mode="tertiary" size="xs">ID</MText>
					<MText mode="tertiary" size="xs">Word</MText>
					<MText mode="tertiary" size="xs">Status</MText>
					<MText mode="tertiary" size="xs">Topic</MText>
					<MText mode="tertiary" size="xs">Catalog</MText>
					<MText mode="tertiary" size="xs">Meaning</MText>
					<MText mode="tertiary" size="xs">Created</MText>
					{group.items.map((word) => (
						<Fragment key={word.id}>
							<MText mode="primary" size="s">{word.id}</MText>
							<MText mode="primary" size="s">{word.word}</MText>
							<MBadge mode={word.status === "processed" ? "success" : "warning"}>
								{word.status}
							</MBadge>
							<MText mode="secondary" size="s">{word.topicData?.title ?? "—"}</MText>
							<MText mode="secondary" size="s">{word.catalogData?.title ?? "—"}</MText>
							<MText mode="secondary" size="s">{word.meaning ?? "—"}</MText>
							<MText mode="secondary" size="s">
								{new Date(word.created_at).toLocaleDateString()}
							</MText>
						</Fragment>
					))}
				</MGrid>
			)}
		</div>
	);
}

export default function ManageSynonyms() {
	const [groups, setGroups] = useState<SynonymGroup[]>([]);
	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [language, setLanguage] = useState("all");

	const load = useCallback(async (currentOffset: number, lang: string) => {
		const data = await fetchSynonymsAction({
			limit: LIMIT,
			offset: currentOffset,
			language: lang !== "all" ? lang : undefined,
		});
		setGroups(data.groups);
		setTotal(data.total);
	}, []);

	useEffect(() => {
		void load(offset, language);
	}, [load, offset, language]);

	const handleLanguageChange = useCallback((lang: string) => {
		setLanguage(lang);
		setOffset(0);
	}, []);

	const totalPages = Math.ceil(total / LIMIT);
	const currentPage = Math.floor(offset / LIMIT) + 1;

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
				<MHeading mode="h1">Synonym Words</MHeading>

				<MFlex direction="row" gap="m" align="end">
					<MSelect
						name="language"
						options={languageOptions}
						value={language}
						onChange={(e) => handleLanguageChange(e.target.value)}
					/>
				</MFlex>

				{total === 0 ? (
					<MText mode="secondary">No synonym groups found.</MText>
				) : (
					<MFlex
						direction="column"
						align="stretch"
						justify="start"
						gap="m"
						style={{ width: "100%" }}
					>
						<MText mode="secondary" size="s">
							{total} synonym group{total !== 1 ? "s" : ""} found
						</MText>

						{groups.map((group) => (
							<SynonymGroupRow
								key={`${group.language}-${group.word}`}
								group={group}
							/>
						))}

						{totalPages > 1 && (
							<div className={styles.pagination}>
								<MButton
									mode="tertiary"
									size="s"
									disabled={offset === 0}
									onClick={() => setOffset((p) => Math.max(0, p - LIMIT))}
								>
									Previous
								</MButton>
								<MText mode="secondary" size="s">
									{currentPage} / {totalPages}
								</MText>
								<MButton
									mode="tertiary"
									size="s"
									disabled={offset + LIMIT >= total}
									onClick={() => setOffset((p) => p + LIMIT)}
								>
									Next
								</MButton>
							</div>
						)}
					</MFlex>
				)}
			</MFlex>
		</main>
	);
}
