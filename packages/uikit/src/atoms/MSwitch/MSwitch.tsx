import clsx from "clsx";
import { type ReactNode, useId, useMemo } from "react";
import type { BasicInputProps } from "../../types/BasicInputProps";
import MFlex from "../MFlex/MFlex";
import styles from "./MSwitch.module.css";

type SwitchProps = BasicInputProps & {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	borderType?: "round" | "rectangular";
};

export const MSwitch = ({
	disabled,
	id,
	name,
	leftIcon,
	rightIcon,
	className,
	borderType = "round",
	...restProps
}: SwitchProps) => {
	const uuid = useId();
	const fieldId = useMemo(() => id ?? uuid, [uuid, id]);

	return (
		<MFlex className={clsx(styles.switchWrapper, className)}>
			<label className={styles.switch}>
				<input
					type="checkbox"
					id={fieldId}
					name={name}
					disabled={disabled}
					{...restProps}
				/>

				<span className={clsx(styles.slider, styles[borderType])}>
					<span className={clsx(styles.control)}>
						{leftIcon && (
							<span className={clsx(styles.customSwitchIconLeft)}>
								{leftIcon}
							</span>
						)}

						{rightIcon && (
							<span className={clsx(styles.customSwitchIconRight)}>
								{rightIcon}
							</span>
						)}
					</span>
				</span>
			</label>
		</MFlex>
	);
};

export default MSwitch;
