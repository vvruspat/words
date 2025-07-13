"use client";

import clsx from "clsx";
import { useState } from "react";
import { MButton } from "../MButton";
import { MCalendar } from "../MCalendar";
import { MDropdown } from "../MDropdown";
import { type InputProps, MInput } from "../MInput";
import { CalendarIcon } from "./CalendarIcon";
import styles from "./MDatepicker.module.css";

type MDatepickerProps = InputProps & {
	type?: Extract<
		InputProps["type"],
		"date" | "datetime-local" | "month" | "week"
	>;
};

export const MDatepicker = ({
	type = "date",
	className,
	defaultValue,
	...inputProps
}: MDatepickerProps) => {
	const [open, setOpen] = useState(false);
	const [date, setDate] = useState(
		defaultValue ? new Date(defaultValue.toString()) : new Date(),
	);
	const [dateValue, setDateValue] = useState(defaultValue);

	const onDateChange = (date: Date) => {
		try {
			setDateValue(date.toISOString().split("T")[0]);
		} catch (_e) {}
	};

	const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		try {
			const d = new Date(event.target.value);

			setDate(d);
			setDateValue(d.toISOString().split("T")[0]);
		} catch (_e) {}
	};

	return (
		<MDropdown
			open={open}
			onClose={() => setOpen(false)}
			dropdownContent={<MCalendar onChange={onDateChange} date={date} />}
			stretch={false}
			align="right"
			noPadding
		>
			<MInput
				type={type}
				{...inputProps}
				value={dateValue}
				onChange={onInputChange}
				defaultValue={defaultValue}
				className={clsx(className, styles.datepickerInput)}
				onFocus={() => setOpen(true)}
				after={
					<MButton
						mode="transparent"
						onClick={() => setOpen(true)}
						type="button"
					>
						<CalendarIcon />
					</MButton>
				}
			/>
		</MDropdown>
	);
};

export default MDatepicker;
