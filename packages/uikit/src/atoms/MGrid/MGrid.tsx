import clsx from "clsx";
import type { ComponentProps } from "react";
import styles from "./MGrid.module.css";

export type MGridProps = ComponentProps<"div"> & {
	display?: "grid" | "inline-grid";
	columnTemplate?: string;
	rowTemplate?: string;
	rowGap?: "xs" | "s" | "m" | "l" | "xl" | "2xl" | "3xl" | "4xl" | "none";
	columnGap?: "xs" | "s" | "m" | "l" | "xl" | "2xl" | "3xl" | "4xl" | "none";
	alignItems?: "start" | "center" | "end" | "stretch";
	justifyItems?:
		| "start"
		| "center"
		| "end"
		| "space-between"
		| "space-around"
		| "stretch";
};

export const MGrid = ({
	children,
	className,
	style = {},
	display = "grid",
	rowTemplate,
	columnTemplate = "max-content max-content",
	rowGap = "s",
	columnGap = "m",
	alignItems,
	justifyItems,
	...restProps
}: MGridProps) => {
	return (
		<div
			className={clsx(
				styles[`grid-row-gap-${rowGap}`],
				styles[`grid-col-gap-${columnGap}`],
				className,
			)}
			style={{
				display: display,
				gridTemplateRows: rowTemplate,
				gridTemplateColumns: columnTemplate,
				justifyItems: justifyItems,
				alignItems: alignItems,
				...style,
			}}
			{...restProps}
		>
			{children}
		</div>
	);
};

export default MGrid;
