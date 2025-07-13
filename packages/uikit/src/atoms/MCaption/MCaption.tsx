import clsx from "clsx";
import type { TComponentStatus } from "../../types/TComponentStatus";
import MText, { type TextProps } from "../MText/MText";
import styles from "./MCaption.module.css";

type CaptionProps = Omit<TextProps, "size"> & Partial<TComponentStatus>;

export const MCaption = ({
	status = "regular",
	children,
	className,
	...restProps
}: CaptionProps) => {
	return (
		<MText
			size="m"
			className={clsx(styles.caption, styles[status], className)}
			{...restProps}
		>
			{children}
		</MText>
	);
};

export default MCaption;
