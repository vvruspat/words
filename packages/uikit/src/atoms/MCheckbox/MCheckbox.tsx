"use client";

import clsx from "clsx";
import { type MouseEvent, type ReactNode, useId, useMemo, useRef } from "react";
import type { BasicInputProps } from "../../types/BasicInputProps";
import MButton from "../MButton";
import MFieldDescription from "../MFieldDescription";
import MFlex from "../MFlex";
import MLabel from "../MLabel";

import styles from "./MCheckbox.module.css";
import "./MCheckbox.vars.css";
import { MIconCheck } from "../MIcon/icons/MIconCheck";

type CheckboxProps = BasicInputProps & {
	label: ReactNode;
	description?: ReactNode;
	wrapperClassName?: string;
	footerClassName?: string;
	icon?: ReactNode;
};

export const MCheckbox = ({
	id,
	name,
	status = "regular",
	label,
	disabled = false,
	description,
	checked,
	wrapperClassName,
	footerClassName,
	icon,
	...restProps
}: CheckboxProps) => {
	const uuid = useId();
	const fieldId = useMemo(() => id ?? uuid, [uuid, id]);
	const checkboxRef = useRef<HTMLInputElement>(null);

	const onCheckboxClick = (_e: MouseEvent<HTMLDivElement>) => {
		if (checkboxRef.current) {
			checkboxRef.current.focus();
		}
	};

	return (
		<MButton
			mode="transparent"
			className={clsx(styles.checkboxWrapper, styles[status], wrapperClassName)}
			onClick={onCheckboxClick}
		>
			<MFlex className={clsx(styles.checkboxContainer)}>
				<input
					type="checkbox"
					ref={checkboxRef}
					className={clsx(styles.Checkbox)}
					id={fieldId}
					name={name}
					disabled={disabled}
					{...restProps}
				/>

				<MLabel htmlFor={fieldId}>{label}</MLabel>
				<span className={clsx(styles.customCheckboxIcon)}>
					{icon ? (
						icon
					) : (
						<MIconCheck
							mode="bold"
							width={10}
							color={status === "invalid" ? "#dc2020" : "#ffffff"}
						/>
					)}
				</span>
			</MFlex>
			<div className={footerClassName}>
				{description && (
					<MFieldDescription status={status}>{description}</MFieldDescription>
				)}
			</div>
		</MButton>
	);
};

export default MCheckbox;
