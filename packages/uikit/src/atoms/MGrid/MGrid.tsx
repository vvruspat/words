import clsx from "clsx";
import type {
	ComponentPropsWithoutRef,
	CSSProperties,
	ElementType,
	ReactNode,
} from "react";
import styles from "./MGrid.module.css";

export type MGridProps<T extends ElementType = "div"> = {
	tag?: T;
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
	className?: string;
	style?: CSSProperties;
	children?: ReactNode;
} & ComponentPropsWithoutRef<T>;

export const MGrid = <T extends ElementType = "div">({
	children,
	className,
	tag,
	style = {},
	display = "grid",
	rowTemplate,
	columnTemplate = "max-content max-content",
	rowGap = "s",
	columnGap = "m",
	alignItems,
	justifyItems,
	...restProps
}: MGridProps<T>) => {
	const Element = tag ?? "div";
	return (
		<Element
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
		</Element>
	);
};

export default MGrid;
