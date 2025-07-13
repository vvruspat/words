import { useEffect, useState } from "react";
import { MDivider } from "../MDivider";
import { MFlex } from "../MFlex";
import styles from "./MCalendar.module.css";
import { MDaySelector } from "./MDaySelector";
import { MMonthSelector } from "./MMonthSelector";
import { MYearSelector } from "./MYearSelector";
import "./MCalendar.vars.css";

type MCalendarProps = {
	startDate?: Date;
	endDate?: Date;
	defaultValue?: Date;
	date?: Date;
	onChange?: (date: Date) => void;
};

export const MCalendar = ({
	startDate,
	endDate,
	defaultValue = new Date(),
	date: currentDate,
	onChange,
}: MCalendarProps) => {
	const [currentMonth, setCurrentMonth] = useState<number>(
		defaultValue.getMonth(),
	);
	const [currentYear, setCurrentYear] = useState<number>(
		defaultValue.getFullYear(),
	);
	const [currentDay, setCurrentDay] = useState<number>(defaultValue.getDate());

	const onDateChange = (year: number, month: number, day: number) => {
		const date = new Date(year, month, day + 1);
		onChange?.(date);
	};

	const onMonthChange = (month: number) => {
		setCurrentMonth(month);
		onDateChange(currentYear, month, currentDay);
	};

	const onYearChange = (year: number) => {
		setCurrentYear(year);
		onDateChange(year, currentMonth, currentDay);
	};

	const onDayChange = (day: number) => {
		setCurrentDay(day);
		onDateChange(currentYear, currentMonth, day);
	};

	useEffect(() => {
		if (currentDate) {
			const month = currentDate.getMonth();
			const year = currentDate.getFullYear();
			const day = currentDate.getDate();

			!Number.isNaN(month) && setCurrentMonth(currentDate.getMonth());
			!Number.isNaN(year) && setCurrentYear(currentDate.getFullYear());
			!Number.isNaN(day) && setCurrentDay(currentDate.getDate());
		}
	}, [currentDate]);

	return (
		<MFlex direction="column" className={styles.calendar} gap="none">
			<MFlex direction="row" gap="xl" className={styles.calendarHeader}>
				<MMonthSelector month={currentMonth} onChange={onMonthChange} />
				<MYearSelector
					year={currentYear}
					onChange={onYearChange}
					startYear={startDate?.getFullYear()}
					endYear={endDate?.getFullYear()}
				/>
			</MFlex>

			<MDivider />

			<MDaySelector
				className={styles.calendarDaySelector}
				day={currentDay}
				year={currentYear}
				month={currentMonth}
				onChange={onDayChange}
			/>
		</MFlex>
	);
};

export default MCalendar;
