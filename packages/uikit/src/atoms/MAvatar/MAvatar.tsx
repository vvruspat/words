import clsx from "clsx";
import type { ComponentProps } from "react";
import { MFlex } from "../../atoms/MFlex";
import type { TComponentSize } from "../../types/TComponentSize";
import "./MAvatar.vars.css";
import styles from "./MAvatar.module.css";

export type MAvatarProps = ComponentProps<"img"> & {
	size?: Exclude<TComponentSize["size"], "inherit">;
};

export const MAvatar = ({
	size = "2xl",
	className,
	...imgProps
}: MAvatarProps) => {
	return (
		<MFlex className={clsx(styles.avatar, styles[`avatar-size-${size}`])}>
			<img {...imgProps} className={clsx(styles.image, className)} />
		</MFlex>
	);
};

export default MAvatar;
