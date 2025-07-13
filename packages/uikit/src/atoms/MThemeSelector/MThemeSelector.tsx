"use client";

import { useEffect, useState } from "react";
import { MButton } from "../MButton";
import type { MDropdownProps } from "../MDropdown";
import { MDropdown } from "../MDropdown";
import { MIconMoon } from "../MIcon/icons/MIconMoon";
import { MIconSun } from "../MIcon/icons/MIconSun";
import type { SelectOption } from "../MList";
import { MList } from "../MList";
import type { ListItemProps } from "../MListItem";
import styles from "./MThemeSelector.module.css";

type MThemeSelectorProps = Partial<Omit<MDropdownProps, "dropdownContent">> & {
	onSelectedTheme?: (theme: string) => void;
	defaultTheme?: string;
};

type MThemeSelectorOption = ListItemProps & SelectOption;

export const MThemeSelector = ({
	onSelectedTheme,
	stretch,
	open: defaultOpen = false,
	defaultTheme = "light",
	...restDropdownProps
}: MThemeSelectorProps) => {
	const [selectedTheme, setSelectedTheme] = useState(defaultTheme);
	const [open, setOpen] = useState(defaultOpen);

	useEffect(() => {
		const element = document.getElementsByTagName("html")[0];

		if (element) {
			element.dataset.theme = selectedTheme;
		}
	}, [selectedTheme]);

	const onThemeChoose = (option: MThemeSelectorOption) => {
		if (option) {
			setSelectedTheme(option.key);
			onSelectedTheme?.(option.key);
		}

		setOpen(false);
	};

	const onClick = () => {
		setOpen(!open);
	};

	return (
		<MDropdown
			dropdownContent={
				<MList
					options={[
						{
							key: "light",
							value: "light",
						},
						{
							key: "dark",
							value: "dark",
						},
					]}
					showDivider
					onChoose={onThemeChoose}
				/>
			}
			stretch={stretch ?? false}
			open={open}
			dropdownContentClassName={styles.dropdownContainer}
			{...restDropdownProps}
		>
			<MButton
				onClick={onClick}
				before={
					selectedTheme === "light" ? (
						<MIconSun mode="regular" width={24} />
					) : (
						<MIconMoon mode="regular" width={24} />
					)
				}
			>
				Select theme
			</MButton>
		</MDropdown>
	);
};

export default MThemeSelector;
