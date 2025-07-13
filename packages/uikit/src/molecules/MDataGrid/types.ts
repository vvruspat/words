import type { ComponentProps, ReactElement, ReactNode } from "react";

export type MDataGridHeaderType = ComponentProps<"th"> & {
	field: string;
	label: ReactNode;
	sortable?: boolean;
	editable?: boolean;
	filterFunction?: (
		value: MDataGridCellValue,
		filterValue: string | number,
		field: string,
		row: MDataGridRowType,
	) => boolean;
	renderFilter?: (
		props: ComponentProps<"input">,
	) => ReactElement<ComponentProps<"input">>;
	renderCell?: (value: MDataGridCellValue) => ReactNode;
};

export type MDataGridCellValue = string | number | boolean | object;

export type MDataGridRowType = Record<string, MDataGridCellValue> & {
	id: string | number;
};

export type MDataGridPagination = {
	total: number;
	limit?: number;
	onLoadMore: (
		offset: number,
		limit: number,
		filters: Record<string, string>,
		sortBy?: string,
		sortOrder?: "asc" | "desc",
	) => Promise<MDataGridRowType[]>;
};
