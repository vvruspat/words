import clsx from "clsx";
import styles from "./MFlex.module.css";
import "./MFlex.vars.css";
import type React from "react";

export type MFlexProps<T extends React.ElementType = "div"> = {
	as?: T;
	gap?: "xs" | "s" | "m" | "l" | "xl" | "2xl" | "3xl" | "4xl" | "none";
	direction?: "row" | "column" | "row-reverse" | "column-reverse";
	align?: "start" | "center" | "end" | "stretch";
	justify?:
		| "start"
		| "center"
		| "end"
		| "space-between"
		| "space-around"
		| "stretch";
	wrap?: "wrap" | "nowrap";
} & Omit<React.ComponentPropsWithoutRef<T>, "as">;

export const MFlex = <T extends React.ElementType = "div">({
	as,
	children,
	className,
	style,
	gap = "s",
	direction = "row",
	align = "center",
	justify = "start",
	wrap = "wrap",
	...restProps
}: MFlexProps<T>) => {
	const Element = as ?? "div";

	return (
		<Element
			className={clsx(styles.flex, styles[`flex-gap-${gap}`], className)}
			style={{
				flexDirection: direction,
				alignItems: align,
				justifyContent: justify,
				flexWrap: wrap,
				...(style ?? {}),
			}}
			{...restProps}
		>
			{children}
		</Element>
	);
};

export default MFlex;
