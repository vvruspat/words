import clsx from "clsx";
import { type ChangeEvent, type ComponentProps } from "react";
import { MButton, MSelect } from "../../atoms";
import { MIconCaretLeft } from "../../atoms/MIcon/icons/MIconCaretLeft";
import { MIconCaretRight } from "../../atoms/MIcon/icons/MIconCaretRight";
import type { MSelectOption } from "../../atoms/MSelect/MSelect";
import styles from "./MDataGridPagination.module.css";

export interface MDataGridPaginationProps extends ComponentProps<"nav"> {
	total: number;
	limit: number;
	offset: number;
	onNextPage: (offset: number, limit: number) => void;
	onPreviousPage: (offset: number, limit: number) => void;
	onRowsPerPageChange: (limit: number) => void;
}

export const MDataGridPagination = ({
	className,
	total,
	limit,
	offset,
	onNextPage,
	onPreviousPage,
	onRowsPerPageChange,
	...restProps
}: MDataGridPaginationProps) => {
	const isPreviousDisabled = offset - limit < 0;
	const isNextDisabled = offset + limit >= total;

	const onNextPageClick = () => {
		onNextPage(offset + limit, limit);
	};

	const onPrevPageClick = () => {
		onPreviousPage(Math.max(offset - limit, 0), limit);
	};

	const rowsPerPageOptions: MSelectOption[] = [5, 10, 25, 50].map((num) => ({
		key: num.toString(),
		value: num.toString(),
	}));

	return (
		<nav
			aria-label="Table pagination"
			className={clsx(styles.pagination, className)}
			{...restProps}
		>
			<div className={styles.rowsPerPageButton}>
				<div className={styles.rowsPerPageLabel}>Rows per page:</div>
				<MSelect
					aria-label="Rows per page selector"
					onChange={(e: ChangeEvent<HTMLInputElement>) =>
						onRowsPerPageChange(Number(e.target.value))
					}
					options={rowsPerPageOptions}
					defaultValue={limit.toString()}
				/>
			</div>

			<div className={styles.pagesNavigation}>
				<div aria-live="polite" className={styles.pages}>
					{offset + 1}&ndash;{Math.min(offset + limit, total)} of {total}
				</div>

				<div className={styles.buttons}>
					<MButton
						mode="transparent"
						aria-label="Previous page"
						onClick={onPrevPageClick}
						disabled={isPreviousDisabled}
						noPadding
					>
						<MIconCaretLeft mode="regular" width={20} />
					</MButton>
					<MButton
						mode="transparent"
						aria-label="Next page"
						onClick={onNextPageClick}
						disabled={isNextDisabled}
						noPadding
					>
						<MIconCaretRight mode="regular" width={20} />
					</MButton>
				</div>
			</div>
		</nav>
	);
};
