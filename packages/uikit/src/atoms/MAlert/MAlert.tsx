import clsx from "clsx";
import type { ComponentProps } from "react";
import { MFlex } from "../../atoms/MFlex";
import "./MAlert.vars.css";
import styles from "./MAlert.module.css";

export type MAlertProps = ComponentProps<typeof MFlex> & {
	mode?: "error" | "warning" | "success" | "info";
};

export const MAlert = ({
	mode = "info",
	className,
	children,
	...restProps
}: MAlertProps) => {
	return (
		<MFlex
			className={clsx(styles.alert, styles[`alert-mode-${mode}`], className)}
			{...restProps}
		>
			{children}
		</MFlex>
	);
};

export default MAlert;
