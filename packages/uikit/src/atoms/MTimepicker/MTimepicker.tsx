"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import { MButton } from "../MButton";
import { type InputProps, MInput } from "../MInput";
import styles from "./MTimepicker.module.css";
import { TimeIcon } from "./TimeIcon";

type MTimepickerProps = InputProps & {
	type?: Extract<InputProps["type"], "time" | "time-local">;
};

export const MTimepicker = ({
	type = "time",
	className,
	defaultValue,
	...inputProps
}: MTimepickerProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [dateValue, setDateValue] = useState(defaultValue);

	const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const d = new Date(event.target.value);

			setDateValue(d.toISOString().split("T")[0]);
		} catch (_e) {}
	};

	return (
		<MInput
			type={type}
			{...inputProps}
			value={dateValue}
			onChange={onInputChange}
			defaultValue={defaultValue}
			className={clsx(className, styles.timepickerInput)}
			ref={inputRef}
			after={
				<MButton
					mode="transparent"
					onClick={() => {
						inputRef.current?.showPicker();
					}}
					type="button"
				>
					<TimeIcon />
				</MButton>
			}
		/>
	);
};

export default MTimepicker;
