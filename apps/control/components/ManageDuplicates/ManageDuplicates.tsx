"use client";

import {
	MBadge,
	MButton,
	MFlex,
	MGrid,
	MHeading,
	MIconCaretDown,
	MIconTrash,
	MSelect,
	MText,
} from "@repo/uikit";
import { AVAILABLE_LANGUAGES, type Language } from "@vvruspat/words-types";
import { Fragment, useCallback, useEffect, useState } from "react";
import { deleteWordAction } from "@/actions/deleteWordAction";
import {
	type DuplicateGroup,
	fetchDuplicatesAction,
} from "@/actions/fetchDuplicatesAction";
import styles from "./ManageDuplicates.module.css";

const LIMIT = 20;

const languageOptions = [
	{ key: "all", value: "All languages" },
	...Object.entries(AVAILABLE_LANGUAGES).map(([key, value]) => ({
		key,
		value: value as string,
	})),
];

function DuplicateGroupRow({
	group,
	onDelete,
}: {
	group: DuplicateGroup;
	onDelete: (id: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<Set<number>>(new Set());

	const handleDelete = useCallback(
		async (word: DuplicateGroup["items"][number]) => {
			setPendingDelete((prev) => new Set(prev).add(word.id));
			try {
				await deleteWordAction(word.id);
				onDelete(word.id);
			} finally {
				setPendingDelete((prev) => {
					const next = new Set(prev);
					next.delete(word.id);
					return next;
				});
			}
		},
		[onDelete],
	);

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
					<MBadge mode="warning">
						<MText mode="secondary" size="xs">
							{group.items.length} duplicates
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
					columnTemplate="max-content 1fr max-content 1fr 1fr 2fr max-content max-content"
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
					<div />
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
							<MButton
								mode="tertiary"
								size="s"
								title="Delete"
								disabled={pendingDelete.has(word.id)}
								onClick={() => void handleDelete(word)}
							>
								<MIconTrash mode="regular" width={16} height={16} />
							</MButton>
						</Fragment>
					))}
				</MGrid>
			)}
		</div>
	);
}

export default function ManageDuplicates() {
	const [groups, setGroups] = useState<DuplicateGroup[]>([]);
	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [language, setLanguage] = useState("all");

	const load = useCallback(async (currentOffset: number, lang: string) => {
		const data = await fetchDuplicatesAction({
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

	const handleDelete = useCallback((deletedId: number) => {
		setGroups((prev) =>
			prev
				.map((g) => ({
					...g,
					items: g.items.filter((w) => w.id !== deletedId),
				}))
				.filter((g) => g.items.length > 1),
		);
	}, []);

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
				<MHeading mode="h1">Duplicate Words</MHeading>

				<MFlex direction="row" gap="m" align="end">
					<MSelect
						name="language"
						options={languageOptions}
						value={language}
						onChange={(e) => handleLanguageChange(e.target.value)}
					/>
				</MFlex>

				{total === 0 ? (
					<MText mode="secondary">No duplicates found.</MText>
				) : (
					<MFlex
						direction="column"
						align="stretch"
						justify="start"
						gap="m"
						style={{ width: "100%" }}
					>
						<MText mode="secondary" size="s">
							{total} duplicate group{total !== 1 ? "s" : ""} found
						</MText>

						{groups.map((group) => (
							<DuplicateGroupRow
								key={`${group.language}-${group.word}`}
								group={group}
								onDelete={handleDelete}
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
