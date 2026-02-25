"use client";

import { MButton, MDropdown, MFlex, MText } from "@repo/uikit";
import { AVAILABLE_LANGUAGES, type Language, type WordTranslation } from "@vvruspat/words-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { updateTranslationAction } from "@/actions/updateTranslationAction";
import { useTranslationsStore } from "@/stores/useTranslationsStore";
import styles from "./TranslationsDropdown.module.css";

export type TranslationsDropdownProps = {
	id: number;
	translations: Map<number, Map<string, WordTranslation>>;
};

function EditableTranslation({
	translation,
	onSave,
	onCancel,
}: {
	translation: WordTranslation;
	onSave: (value: string) => void;
	onCancel: () => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	return (
		<input
			ref={inputRef}
			className={styles.translationInput}
			defaultValue={translation.translation}
			onKeyDown={(e) => {
				if (e.key === "Enter") onSave(e.currentTarget.value);
				if (e.key === "Escape") onCancel();
			}}
			onBlur={(e) => onSave(e.target.value)}
		/>
	);
}

export function TranslationsDropdown({
	id,
	translations,
}: TranslationsDropdownProps) {
	const [open, setOpen] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const { updateTranslation } = useTranslationsStore();

	const handleSave = useCallback(
		async (translation: WordTranslation, newValue: string) => {
			setEditingId(null);
			if (!newValue.trim() || newValue === translation.translation) return;
			const updated = await updateTranslationAction(
				translation.id,
				newValue.trim(),
			);
			updateTranslation(updated);
		},
		[updateTranslation],
	);

	const wordTranslations = Array.from(
		translations.get(Number(id))?.values() ?? [],
	);

	return (
		<MDropdown
			open={open}
			onClose={() => setOpen(false)}
			dropdownContent={
				<MFlex
					direction="column"
					gap="xs"
					align="stretch"
					style={{ padding: "8px", minWidth: "180px" }}
				>
					{wordTranslations.map((t) => (
						<MFlex key={t.id} direction="column" gap="xs" align="start">
							<MText size="xs" mode="tertiary">
								{AVAILABLE_LANGUAGES[t.language as Language] ?? t.language}
							</MText>
							{editingId === t.id ? (
								<EditableTranslation
									translation={t}
									onSave={(value) => void handleSave(t, value)}
									onCancel={() => setEditingId(null)}
								/>
							) : (
								<MText
									size="m"
									mode="primary"
									className={styles.translationText}
									onDoubleClick={() => setEditingId(t.id)}
									title="Double-click to edit"
								>
									{t.translation}
								</MText>
							)}
						</MFlex>
					))}
					{wordTranslations.length === 0 && (
						<MText size="s" mode="secondary">
							No translations
						</MText>
					)}
				</MFlex>
			}
			stretch={true}
			noPadding
		>
			<MButton mode="tertiary" size="s" onClick={() => setOpen(true)}>
				View {translations.get(Number(id))?.size ?? 0} translations
			</MButton>
		</MDropdown>
	);
}
