"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { MFlex, MSpinner } from "../../atoms";
import styles from "./MDataGrid.module.css";
import { MDataGridHeader } from "./MDataGridHeader";
import { MDataGridRow } from "./MDataGridRow";
import type {
	MDataGridHeaderType,
	MDataGridPagination,
	MDataGridRowType,
} from "./types";
import "./MDataGrid.vars.css";

type MDataGridProps = {
	headers: MDataGridHeaderType[];
	rows?: MDataGridRowType[];
	onSelect?: (selected: MDataGridRowType[]) => void;
	onSort?: (field: string, direction: "asc" | "desc") => void;
	pagination: MDataGridPagination;
};

export const MDataGrid = ({
	headers,
	rows,
	onSelect,
	onSort,
	pagination,
}: MDataGridProps) => {
	const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
		new Set(),
	);
	const [sortedField, setSortedField] = useState<string | null>(null);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [filters, setFilters] = useState<Map<string, string>>(new Map());
	const [currentRows, setCurrentRows] = useState<MDataGridRowType[]>(
		rows ?? [],
	);
	const [loading, setLoading] = useState<boolean>(false);

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
					[...newSelectedRows].map((id) =>
						currentRows.find((row) => row.id === id),
					),
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

	const loadMoreRows = useCallback(async () => {
		setLoading(true);
		const newRows = await pagination.onLoadMore(
			sortedRows.length,
			pagination.limit ?? 10,
			[...filters.entries()].reduce<Record<string, string>>(
				(acc, [key, value]) => {
					acc[key] = value;
					return acc;
				},
				{},
			),
			sortedField || undefined, // sortedField could be null, in this case better not to pass it to the function
			sortedField ? sortOrder : undefined,
		);
		setCurrentRows((prevRows) => [...prevRows, ...newRows]);
		setLoading(false);
	}, [pagination, sortedRows.length, sortedField, sortOrder, filters]);

	useEffect(() => {
		if (!rows?.length) {
			loadMoreRows();
		}
	}, [rows, loadMoreRows]);

	return (
		<div className={styles.dataGridContainer}>
			<TableVirtuoso
				className={styles.dataGridTable}
				data={filteredRows}
				endReached={loadMoreRows}
				useWindowScroll
				fixedHeaderContent={() => (
					<tr>
						{onSelect && <th />}
						{headers.map((header) => (
							<MDataGridHeader
								{...header}
								key={header.field}
								sortingNow={sortedField === header.field}
								onSort={(direction) => handleSort(header.field, direction)}
								onFilter={handleFilter}
							/>
						))}
					</tr>
				)}
				itemContent={(_index, row: MDataGridRowType) => (
					<MDataGridRow
						row={row}
						headers={headers}
						key={row.id}
						onCheckboxChange={onSelect ? toggleSelect : undefined}
						selected={selectedRows.has(row.id)}
					/>
				)}
			/>
			{loading && (
				<MFlex
					align="center"
					justify="center"
					className={styles.loadingSpinner}
				>
					<MSpinner mode="primary" size="m" />
				</MFlex>
			)}
		</div>
	);
};

export default MDataGrid;
