import clsx from "clsx";
import { useCallback } from "react";
import { MCheckbox, MFlex } from "../../atoms";
import styles from "./MDataGridRow.module.css";
import type {
	MDataGridCellValue,
	MDataGridHeaderType,
	MDataGridRowType,
} from "./types";

type MDataGridRowProps = {
	row: MDataGridRowType;
	headers: MDataGridHeaderType[];
	selected: boolean;
	onCheckboxChange?: (row: MDataGridRowType, checked: boolean) => void;
};

export const MDataGridRow = ({
	row,
	headers,
	selected,
	onCheckboxChange,
}: MDataGridRowProps) => {
	const renderCell = useCallback(
		(
			header: MDataGridHeaderType,
			rowId: string | number,
			cell?: MDataGridCellValue,
		) => {
			return (
				<td
					key={`${header.field}-${rowId}`}
					className={clsx({ [styles.selected]: selected })}
				>
					{cell ? (header.renderCell?.(cell) ?? cell.toString()) : ""}
				</td>
			);
		},
		[selected],
	);

	return (
		<>
			{onCheckboxChange && (
				<td className={clsx({ [styles.selected]: selected })}>
					<MFlex
						align="center"
						justify="center"
						className={styles.checkboxCell}
					>
						<MCheckbox
							label={""}
							onChange={(event) => onCheckboxChange(row, event.target.checked)}
							defaultChecked={selected}
						/>
					</MFlex>
				</td>
			)}
			{headers.map((header) => renderCell(header, row.id, row[header.field]))}
		</>
	);
};
