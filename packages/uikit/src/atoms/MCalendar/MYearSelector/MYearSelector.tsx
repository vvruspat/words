import { useMemo, useState } from "react";
import { MButton } from "../../MButton";
import { MDropdown } from "../../MDropdown";
import { MIconCaretDown } from "../../MIcon";
import { MList, type SelectOption } from "../../MList";
import { MText } from "../../MText";
import styles from "./MYearSelector.module.css";

type MYearSelectorProps = {
	startYear?: number;
	endYear?: number;
	year: number;
	onChange: (year: number) => void;
};

export const MYearSelector = ({
	year = new Date().getFullYear(),
	startYear = new Date().getFullYear() - 10,
	endYear = new Date().getFullYear() + 10,
	onChange,
}: MYearSelectorProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const years: SelectOption[] = useMemo(
		() =>
			Array.from({ length: endYear - startYear }, (_, i) => ({
				key: `${i}`,
				value: startYear + i,
				onClick: () => {
					onChange(startYear + i);
					setIsOpen(false);
				},
			})),
		[onChange, startYear, endYear],
	);

	return (
		<MDropdown
			open={isOpen}
			onClose={() => setIsOpen(false)}
			stretch={true}
			noPadding
			dropdownContent={<MList options={years} />}
			dropdownContentClassName={styles.dropdownContent}
		>
			<MButton
				type="button"
				mode="transparent"
				after={<MIconCaretDown mode="regular" width={16} />}
				onClick={() => setIsOpen((prevOpen) => !prevOpen)}
			>
				<MText className={styles.yearSelector}>{year}</MText>
			</MButton>
		</MDropdown>
	);
};

export default MYearSelector;
