"use client";

import {
	ComponentProps,
	ReactNode,
	useCallback,
	useMemo,
	useState,
} from "react";
import styles from "./MDataGrid.module.css";
import { MDataGridHeader } from "./MDataGridHeader";
import { MDataGridPagination } from "./MDataGridPagination";
import { MDataGridRow } from "./MDataGridRow";
import type {
	MDataGridHeaderType,
	MDataGridPaginationConfig,
	MDataGridRowType,
} from "./types";
import "./MDataGrid.vars.css";

type MDataGridProps = ComponentProps<"table"> & {
	emptyMessage?: ReactNode;
	headers: MDataGridHeaderType[];
	rows?: MDataGridRowType[];
	onSelect?: (selected: MDataGridRowType[]) => void;
	onSort?: (field: string, direction: "asc" | "desc") => void;
	pagination: MDataGridPaginationConfig;
};

export const MDataGrid = ({
	emptyMessage,
	headers,
	rows,
	onSelect,
	onSort,
	pagination,
	...tableProps
}: MDataGridProps) => {
	const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
		new Set(),
	);
	const [sortedField, setSortedField] = useState<string | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [filters, setFilters] = useState<Map<string, string>>(new Map());
	const currentRows = useMemo(() => rows ?? [], [rows]);

	const toggleSelect = useCallback(
		(row: MDataGridRowType, checked: boolean) => {
			setSelectedRows((prev) => {
				const newSelectedRows = new Set(prev);
				if (!checked && newSelectedRows.has(row.id)) {
					newSelectedRows.delete(row.id);
				} else if (checked) {
					newSelectedRows.add(row.id);
				}
				onSelect?.(
					[...newSelectedRows]
						.map((id) => currentRows.find((row) => row.id === id))
						.filter((row): row is MDataGridRowType => row !== undefined),
				);
				return newSelectedRows;
			});
		},
		[onSelect, currentRows],
	);

	const sortedRows = useMemo(() => {
		if (!sortedField) return currentRows;

		/**
		 * In case of sorting function provided,
		 * returning unsorted data and calling external sort function
		 * */
		if (onSort) {
			onSort(sortedField, sortOrder);
			return currentRows;
		}
		return [...currentRows].sort((a, b) => {
			if (!a[sortedField] || !b[sortedField]) return -1;
			if (a[sortedField] < b[sortedField]) return sortOrder === "asc" ? -1 : 1;
			if (a[sortedField] > b[sortedField]) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});
	}, [currentRows, sortedField, sortOrder, onSort]);

	const filteredRows = useMemo(() => {
		if (filters.size === 0) return sortedRows;

		return sortedRows.filter((row) => {
			let filterResult = true;

			for (const [field, filterValue] of filters) {
				if (!row[field]) {
					filterResult &&= true;
					continue;
				}

				const filterFunction = headers.find(
					(header) => header.field === field,
				)?.filterFunction;

				if (filterFunction) {
					filterResult &&= filterFunction(row[field], filterValue, field, row);
					continue;
				}

				if (row[field].toString().includes(filterValue)) {
					filterResult &&= true;
				} else {
					filterResult = false;
				}
			}

			return filterResult;
		});
	}, [sortedRows, filters, headers]);

	const handleSort = (field: string, direction: "asc" | "desc") => {
		setSortedField(field);
		setSortOrder(direction);
	};

	const handleFilter = useCallback((filterValue: string, field: string) => {
		setFilters((currentFilters) => {
			const newFilters = new Map(currentFilters);
			newFilters.set(field, filterValue);
			return newFilters;
		});
	}, []);

	return (
		<div className={styles.dataGridContainer}>
			<table className={styles.dataGridTable} {...tableProps}>
				<thead>
					<tr>
						{onSelect && <th />}
						{headers.map((header) => (
							<MDataGridHeader
								{...header}
								key={`${header.key ?? "header"}-${header.field}`}
								sortingNow={sortedField === header.field}
								onSort={(direction) => handleSort(header.field, direction)}
								onFilter={handleFilter}
							/>
						))}
					</tr>
				</thead>
				<tbody>
					{filteredRows.map((row) => (
						<MDataGridRow
							row={row}
							headers={headers}
							key={row.id}
							onCheckboxChange={onSelect ? toggleSelect : undefined}
							selected={selectedRows.has(row.id)}
						/>
					))}
					{filteredRows.length === 0 && (
						<tr>
							<td colSpan={headers.length + 1} align="center">
								{emptyMessage}
							</td>
						</tr>
					)}
				</tbody>
				<tfoot>
					<tr>
						<td colSpan={headers.length + 1}>
							<MDataGridPagination
								total={pagination.total}
								limit={pagination.limit}
								offset={pagination.offset}
								onNextPage={pagination.onNextPage}
								onPreviousPage={pagination.onPreviousPage}
								onRowsPerPageChange={pagination.onRowsPerPageChange}
							/>
						</td>
					</tr>
				</tfoot>
			</table>
		</div>
	);
};

export default MDataGrid;
