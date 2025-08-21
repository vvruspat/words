import clsx from "clsx";
import type {
	ComponentProps,
	DetailedHTMLProps,
	HTMLAttributes,
	ReactNode,
} from "react";
import styles from "./MListItem.module.css";
import "./MListItem.vars.css";
import { MFlex } from "../MFlex";

export type ListItemProps = DetailedHTMLProps<
	HTMLAttributes<HTMLLIElement>,
	HTMLLIElement
> & {
	showDivider?: boolean;
	noPadding?: boolean;
	after?: ReactNode;
	before?: ReactNode;
} & Pick<
		ComponentProps<typeof MFlex>,
		"direction" | "align" | "justify" | "wrap" | "gap"
	>;
export const MListItem = ({
	children,
	className,
	showDivider,
	noPadding = false,
	after,
	before,
	direction = "row",
	align = "center",
	justify = "start",
	wrap = "nowrap",
	gap = "m",
	...props
}: ListItemProps) => {
	return (
		<li
			className={clsx(styles.item, className, {
				[styles.itemBorder]: showDivider,
				[styles.noPadding]: noPadding,
			})}
			{...props}
		>
			<MFlex
				direction={direction}
				align={align}
				justify={justify}
				wrap={wrap}
				gap={gap}
			>
				{before && <div>{before}</div>}
				{children}
				{after && <div>{after}</div>}
			</MFlex>
		</li>
	);
};

export default MListItem;
