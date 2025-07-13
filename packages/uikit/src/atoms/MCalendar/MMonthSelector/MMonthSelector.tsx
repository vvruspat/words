import { useMemo, useState } from "react";
import { MButton } from "../../MButton";
import { MDropdown } from "../../MDropdown";
import { MIconCaretDown } from "../../MIcon";
import { MList, type SelectOption } from "../../MList";
import { MText } from "../../MText";
import styles from "./MMonthSelector.module.css";

type MMonthSelectorProps = {
	locale?: Intl.LocalesArgument;
	format?: Intl.DateTimeFormatOptions["month"];
	month?: number;
	onChange: (month: number) => void;
};

export const MMonthSelector = ({
	locale = "en-US",
	format = "long",
	month = 0,
	onChange,
}: MMonthSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const months: SelectOption[] = useMemo(() => {
		return Array.from({ length: 12 }, (_, i) => {
			const date = new Date();

			date.setMonth(i);

			return {
				key: `${i}`,
				value: date.toLocaleDateString(locale, { month: format }),
				onClick: () => {
					onChange(i);
					setIsOpen(false);
				},
			};
		});
	}, [onChange, locale, format]);

	const monthString = useMemo(() => {
		const monthDate = new Date();

		monthDate.setMonth(month);

		return monthDate.toLocaleDateString(locale, {
			month: format,
		});
	}, [month, locale, format]);

	return (
		<MDropdown
			open={isOpen}
			onClose={() => setIsOpen(false)}
			stretch={true}
			noPadding
			dropdownContent={<MList options={months} />}
		>
			<MButton
				type="button"
				mode="transparent"
				after={<MIconCaretDown mode="regular" width={16} />}
				onClick={() => setIsOpen((prevOpen) => !prevOpen)}
			>
				<MText className={styles.monthSelector}>{monthString}</MText>
			</MButton>
		</MDropdown>
	);
};

export default MMonthSelector;
