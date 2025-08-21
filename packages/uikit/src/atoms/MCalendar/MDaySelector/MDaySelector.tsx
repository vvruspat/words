import clsx from "clsx";
import { MButton } from "../../MButton";
import { MFlex } from "../../MFlex";
import { MGrid } from "../../MGrid";
import { MWeekdayList } from "../MWeekdays";

import styles from "./MDaySelector.module.css";
import "./MDaySelector.vars.css";

type MDaySelectorProps = {
	locale?: Intl.LocalesArgument;
	format?: Intl.DateTimeFormatOptions["weekday"];
	day: number;
	month: number;
	year: number;
	className?: string;
	onChange: (day: number) => void;
};

export const MDaySelector = ({
	locale = "en-US",
	format = "short",
	day = 22,
	year = 2025,
	month = 0,
	className,
	onChange,
}: MDaySelectorProps) => {
	return (
		<MFlex direction="column" className={className}>
			<MGrid
				rowTemplate="repeat(5, 1fr)"
				columnTemplate="repeat(7, 1fr)"
				alignItems="center"
				justifyItems="center"
			>
				<MWeekdayList locale={locale} format={format} />
				{Array.from({ length: 42 }).map((_, index) => {
					const firstDayOfMonth = new Date(year, month, 1).getDay();
					const daysInMonth = new Date(year, month + 1, 0).getDate();
					const daysInPrevMonth = new Date(year, month, 0).getDate();

					let currentDay = index - firstDayOfMonth + 1;
					let currentMonth = month;
					let currentYear = year;

					if (currentDay <= 0) {
						currentDay = daysInPrevMonth + currentDay;
						currentMonth = month - 1;

						if (currentMonth < 0) {
							currentMonth = 11;
							currentYear = year - 1;
						}
					} else if (currentDay > daysInMonth) {
						currentDay = currentDay - daysInMonth;
						currentMonth = month + 1;

						if (currentMonth > 11) {
							currentMonth = 0;
							currentYear = year + 1;
						}
					}
					const isCurrentMonth = currentMonth === month;
					const isCurrentDay = currentDay === day;
					const isToday =
						new Date().getDate() === currentDay &&
						new Date().getMonth() === currentMonth &&
						new Date().getFullYear() === currentYear;

					return (
						<MButton
							type="button"
							mode="transparent"
							// biome-ignore lint/suspicious/noArrayIndexKey: index is the only unique identifier here
							key={index}
							disabled={!isCurrentMonth}
							className={clsx(styles.day, {
								[styles.selected]: isCurrentDay,
								[styles.today]: isToday,
							})}
							onClick={() => {
								onChange(currentDay);
							}}
						>
							{currentDay}
						</MButton>
					);
				})}
			</MGrid>
		</MFlex>
	);
};

export default MDaySelector;
