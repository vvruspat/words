import { useMemo } from "react";

import styles from "./MWeekdays.module.css";
import "./MWeekdays.vars.css";

type MWeekdayListProps = {
	locale?: Intl.LocalesArgument;
	format?: Intl.DateTimeFormatOptions["weekday"];
};

export const MWeekdayList = ({
	locale = "en-US",
	format = "short",
}: MWeekdayListProps) => {
	const weekdays = useMemo(() => {
		const today = new Date();

		// Start from the first day of the week (Sunday for en-US, Monday for many others)
		const startDay = new Date(today);

		startDay.setDate(today.getDate() - today.getDay());

		const weekdaysLocal = [];
		for (let i = 0; i < 7; i++) {
			const date = new Date(startDay);
			date.setDate(startDay.getDate() + i);

			weekdaysLocal.push(date.toLocaleDateString(locale, { weekday: format }));
		}
		return weekdaysLocal;
	}, [locale, format]);

	return (
		<>
			{weekdays.map((weekday, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: index is the only unique identifier here
				<span key={index} className={styles.weekday}>
					{weekday}
				</span>
			))}
		</>
	);
};

export default MWeekdayList;
