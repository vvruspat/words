import type { Meta, StoryObj } from "@storybook/react";
import { MInput } from "../../atoms";
import { MDataGrid } from "./MDataGrid";
import type { MDataGridHeaderType, MDataGridRowType } from "./types";

const meta: Meta<typeof MDataGrid> = {
	title: "Molecules/Data Display/MDataGrid",
	component: MDataGrid,
};

export default meta;
type Story = StoryObj<typeof MDataGrid>;

export const headers: MDataGridHeaderType[] = [
	{
		field: "name",
		label: "Name",
		sortable: true,
		renderFilter: (props) => (
			<MInput placeholder="Search user by name" {...props} />
		),
	},
	{
		field: "age",
		label: "Age",
		sortable: true,
		renderFilter: (props) => (
			<MInput placeholder="Filter by age" type="number" {...props} />
		),
	},
	{
		field: "dateOfBirth",
		label: "Birth day",
		sortable: true,
		renderCell: (value) => new Date(value as number).toString(),
	},
];

export const initialRows: MDataGridRowType[] = Array.from(
	{ length: 20 },
	(_, i) => ({
		id: i,
		name: `User ${i + 1}`,
		age: 20 + (i % 10),
		dateOfBirth: Date.now() - (20 + (i % 10)) * 1000 * 60 * 60 * 24 * 365,
	}),
);

export const pagination = {
	total: 1000,
	limit: 10,
	onLoadMore: (offset: number, limit: number) => {
		const promise = new Promise<MDataGridRowType[]>((resolve) => {
			const newRows = Array.from({ length: limit }, (_, i) => ({
				fieldId: offset + i,
				id: offset + i,
				name: `User ${offset + i + 1}`,
				age: 20 + ((offset + i) % 100),
				dateOfBirth: Date.now() - (20 + (i % 10)) * 1000 * 60 * 60 * 24 * 365,
			}));
			setTimeout(() => resolve(newRows), 3000);
		});

		return promise;
	},
};

export const Default: Story = {
	args: {
		headers,
		rows: initialRows,
		onSelect: (selected) => console.log("Selected rows:", selected),
		pagination,
	},
};
