import { type ReactNode } from "react";
import MListItem, { type ListItemProps } from "../MListItem/MListItem";
import styles from "./MList.module.css";

export type SelectOption = ListItemProps & {
	key: string;
	value?: ReactNode;
};

type ListComponentProps = {
	options?: SelectOption[];
	showDivider?: boolean;
	noPadding?: boolean;
	onChoose?: (option: SelectOption) => void;
};
export const MList = ({
	options = [],
	showDivider = false,
	onChoose,
	noPadding = false,
}: ListComponentProps) => {
	return (
		<ul className={styles.listItems}>
			{options.map(({ key, ...option }) => (
				<MListItem
					noPadding={noPadding}
					key={key}
					onClick={() => onChoose?.({ key, ...option })}
					{...option}
					showDivider={showDivider}
				>
					{option.value}
					{option.children}
				</MListItem>
			))}
		</ul>
	);
};

export default MList;
