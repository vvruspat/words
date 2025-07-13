import clsx from "clsx";
import React, { type ComponentProps } from "react";
import type { TComponentSize } from "../../types/TComponentSize";
import styles from "./MText.module.css";

export type TextProps = ComponentProps<"span"> &
	Partial<TComponentSize> & {
		as?: "span" | "p" | "div";
	};

export const MText = ({
	children,
	className,
	size = "inherit",
	as = "span",
	...restProps
}: TextProps) => {
	return React.createElement(
		as,
		{
			className: clsx(styles[`size-${size}`], className),
			...restProps,
		},
		children,
	);
};

export default MText;
