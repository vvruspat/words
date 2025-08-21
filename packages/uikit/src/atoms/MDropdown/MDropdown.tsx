"use client";

import clsx from "clsx";
import type React from "react";
import {
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactNode,
	useCallback,
	useEffect,
} from "react";
import styles from "./MDropdown.module.css";
import "./MDropdown.vars.css";
import { usePlatform } from "../../hooks";
import { MButton } from "../MButton";
import { MCard } from "../MCard";
import { MFlex } from "../MFlex";
import { MIconX } from "../MIcon";

export type MDropdownProps = DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
> & {
	open: boolean;
	onClose?: () => void;
	dropdownContent: ReactNode;
	position?: "top" | "bottom";
	align?: "left" | "right";
	stretch: boolean;
	noPadding?: boolean;
	dropdownContentClassName?: string;
};

export const MDropdown = ({
	children,
	open,
	onClose = () => {},
	position = "bottom",
	align = "left",
	stretch = false,
	dropdownContent,
	className,
	noPadding = false,
	dropdownContentClassName,
	...props
}: MDropdownProps) => {
	const platform = usePlatform();

	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			if (open) {
				const target = event.target as HTMLElement;
				if (!target.closest(`.${styles.dropdown}`)) {
					onClose();
				}
			}
		},
		[onClose, open],
	);

	const handleClickInside = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);

	useEffect(() => {
		if (open && platform !== "mobile") {
			document.addEventListener("click", handleClickOutside);
		} else {
			document.removeEventListener("click", handleClickOutside);
		}
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, [open, handleClickOutside, platform]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: TODO: add keyboard support
		// biome-ignore lint/a11y/useSemanticElements: no way to use semantic elements here
		<div
			className={clsx(styles.dropdownContainer, className)}
			{...props}
			onClick={handleClickInside}
			role="button"
			tabIndex={0}
		>
			{children}

			{platform === "mobile" ? (
				<MFlex
					direction="column"
					align="stretch"
					justify="center"
					className={clsx(styles.dropdownMobile, { [styles.open]: open })}
				>
					<MCard
						header={
							<MFlex justify="end" className={styles.dropdownHeader}>
								<MButton mode="round" onClick={() => onClose?.()}>
									<MIconX mode="regular" />
								</MButton>
							</MFlex>
						}
						noPadding={noPadding}
						className={clsx(
							{ [styles.stretch]: stretch },
							dropdownContentClassName,
						)}
					>
						{dropdownContent}
					</MCard>
				</MFlex>
			) : (
				<div
					className={clsx(styles.dropdown, { [styles.open]: open }, [
						styles[position],
						styles[align],
					])}
				>
					<MCard
						noPadding={noPadding}
						className={clsx(
							{ [styles.stretch]: stretch },
							dropdownContentClassName,
						)}
					>
						{dropdownContent}
					</MCard>
				</div>
			)}
		</div>
	);
};

export default MDropdown;
