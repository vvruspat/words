import clsx from "clsx";
import type React from "react";
import type { ReactNode } from "react";
import styles from "./MTab.module.css";
import "./MTab.vars.css";

export interface MTabProps {
	key: string;
	label: string;
	active?: boolean;
	onClick?: () => void;
	content?: ReactNode;
	disabled?: boolean;
	before?: ReactNode;
	after?: ReactNode;
}

export const MTab: React.FC<MTabProps> = ({
	label,
	active,
	onClick,
	disabled,
	before,
	after,
}) => {
	return (
		<li
			aria-disabled={disabled}
			className={clsx(
				styles.tab,
				active && styles.activeTab,
				disabled && styles.disabledTab,
			)}
			onClick={() => !disabled && onClick?.()}
			onKeyDown={(e) => {
				if (!disabled && (e.key === "Enter" || e.key === " ")) {
					onClick?.();
				}
			}}
			tabIndex={disabled ? -1 : 0}
		>
			{before && <span>{before}</span>}
			{label}
			{after && <span>{after}</span>}
		</li>
	);
};

export default MTab;
