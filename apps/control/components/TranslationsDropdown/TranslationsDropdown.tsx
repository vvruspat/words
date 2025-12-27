import { AVAILABLE_LANGUAGES, Language, WordTranslation } from "@repo/types";
import { MButton, MDropdown, MFlex, MList, MText } from "@repo/uikit";
import { useState } from "react";

export type TranslationsDropdownProps = {
	id: number;
	translations: Map<number, Map<string, WordTranslation>>;
};

export function TranslationsDropdown({
	id,
	translations,
}: TranslationsDropdownProps) {
	const [open, setOpen] = useState(false);

	const dropdownOptions = Array.from(
		translations.get(Number(id))?.values() ?? [],
	).map((translation) => ({
		key: translation.id.toString(),
		value: (
			<MFlex
				direction="column"
				gap="s"
				align="start"
				justify="start"
				style={{ width: "100%" }}
			>
				<MText size="xs" mode="tertiary">
					{AVAILABLE_LANGUAGES[translation.language as Language] ??
						translation.language}
				</MText>
				<MText size="m" mode="primary">
					{translation.translation}
				</MText>
			</MFlex>
		),
	}));

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<MDropdown
			open={open}
			onClose={handleClose}
			dropdownContent={<MList options={dropdownOptions} />}
			stretch={true}
			noPadding
		>
			<MButton mode="tertiary" size="s" onClick={handleOpen}>
				View {translations.get(Number(id))?.size ?? 0} translations
			</MButton>
		</MDropdown>
	);
}
