import clsx from "clsx";
import {
	type DetailedHTMLProps,
	type HTMLAttributes,
	type ReactNode,
} from "react";
import styles from "./MBadge.module.css";
import "./MBadge.vars.css";

type BadgeProps = DetailedHTMLProps<
	HTMLAttributes<HTMLDivElement>,
	HTMLDivElement
> & {
	mode: "primary" | "transparent";
	before?: ReactNode;
};

export const MBadge = ({
	children,
	mode = "primary",
	...restProps
}: BadgeProps) => {
	return (
		<div className={clsx(styles.badge, styles[mode])} {...restProps}>
			{children}
		</div>
	);
};

export default MBadge;
