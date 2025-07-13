import clsx from "clsx";
import { type ComponentProps } from "react";
import styles from "./MFlex.module.css";

export type MFlexProps = ComponentProps<"div"> & {
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
};

export const MFlex = ({
	children,
	className,
	style = {},
	gap = "s",
	direction = "row",
	align = "center",
	justify = "start",
	wrap = "wrap",
	...restProps
}: MFlexProps) => {
	return (
		<div
			className={clsx(styles.flex, styles[`flex-gap-${gap}`], className)}
			style={{
				flexDirection: direction,
				alignItems: align,
				justifyContent: justify,
				flexWrap: wrap,
				...style,
			}}
			{...restProps}
		>
			{children}
		</div>
	);
};

export default MFlex;
