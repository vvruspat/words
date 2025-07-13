import clsx from "clsx";
import { useState } from "react";
import { MButton, MFlex } from "../../atoms";
import styles from "./MDataGridHeader.module.css";
import { SortIcon } from "./SortIcon";
import type { MDataGridHeaderType } from "./types";

type MDataGridHeaderProps = MDataGridHeaderType & {
	sortingNow: boolean;
	onSort: (direction: "asc" | "desc") => void;
	onFilter: (filterValue: string, field: string) => void;
};

export const MDataGridHeader = ({
	field,
	label,
	sortable,
	editable,
	sortingNow,
	onFilter,
	renderFilter,
	renderCell,
	onSort,
	...thProps
}: MDataGridHeaderProps) => {
	const [sort, setSort] = useState<"asc" | "desc">("asc");
	const onSortClick = () => {
		if (!sortable) return;

		setSort((prevSort) => {
			const newSort = prevSort === "asc" ? "desc" : "asc";

			onSort?.(newSort);

			return newSort;
		});
	};

	return (
		<th {...thProps}>
			<MFlex direction="column" justify="start" align="stretch">
				<MButton
					mode="transparent"
					onClick={onSortClick}
					className={styles.headerTitle}
					stretch
					justify="space-between"
					after={
						sortable && (
							<SortIcon
								className={clsx(styles.sort, styles[`sort-${sort}`], {
									[styles.sorting]: sortingNow,
								})}
							/>
						)
					}
				>
					{label}
				</MButton>
				<div className={styles.filterWrapper}>
					{renderFilter?.({
						onChange: (event) => onFilter(event.target.value, field),
					})}
				</div>
			</MFlex>
		</th>
	);
};
