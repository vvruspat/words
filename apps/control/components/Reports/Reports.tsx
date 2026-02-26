"use client";

import {
	MBadge,
	MButton,
	MDataGrid,
	MFlex,
	MHeading,
	MIconBugBeetle,
	MIconCheck,
	MIconTrash,
	MSelect,
	MText,
} from "@repo/uikit";
import type { Report } from "@vvruspat/words-types";
import { useCallback, useEffect, useState } from "react";
import { deleteReportAction } from "@/actions/deleteReportAction";
import { fetchReportsAction } from "@/actions/fetchReportsAction";
import { updateReportAction } from "@/actions/updateReportAction";
import { WordDetailModal } from "@/components/WordDetailModal/WordDetailModal";

const STATUS_OPTIONS = [
	{ key: "all", value: "All" },
	{ key: "new", value: "New" },
	{ key: "reviewed", value: "Reviewed" },
	{ key: "resolved", value: "Resolved" },
];

const TYPE_BADGE_MODE: Record<
	Report["type"],
	"info" | "warning" | "success"
> = {
	word: "info",
	translation: "warning",
	audio: "success",
};

const STATUS_BADGE_MODE: Record<
	Report["status"],
	"error" | "warning" | "success"
> = {
	new: "error",
	reviewed: "warning",
	resolved: "success",
};

export default function Reports() {
	const [reports, setReports] = useState<Report[]>([]);
	const [total, setTotal] = useState(0);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(50);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [pendingUpdate, setPendingUpdate] = useState<Set<number>>(new Set());
	const [pendingDelete, setPendingDelete] = useState<Set<number>>(new Set());
	const [selectedWordId, setSelectedWordId] = useState<number | null>(null);

	const fetchReports = useCallback(async () => {
		const data = await fetchReportsAction({
			offset,
			limit,
			status:
				statusFilter !== "all"
					? (statusFilter as Report["status"])
					: undefined,
		});
		setReports(data.items);
		setTotal(data.total);
	}, [offset, limit, statusFilter]);

	useEffect(() => {
		void fetchReports();
	}, [fetchReports]);

	const handleStatusChange = useCallback(
		async (id: number, status: Report["status"]) => {
			setPendingUpdate((prev) => new Set(prev).add(id));
			try {
				const updated = await updateReportAction(id, status);
				setReports((prev) =>
					prev.map((r) => (r.id === id ? { ...r, ...updated } : r)),
				);
			} finally {
				setPendingUpdate((prev) => {
					const next = new Set(prev);
					next.delete(id);
					return next;
				});
			}
		},
		[],
	);

	const handleDelete = useCallback(
		async (id: number) => {
			setPendingDelete((prev) => new Set(prev).add(id));
			try {
				await deleteReportAction(id);
				setReports((prev) => prev.filter((r) => r.id !== id));
				setTotal((prev) => Math.max(0, prev - 1));
			} finally {
				setPendingDelete((prev) => {
					const next = new Set(prev);
					next.delete(id);
					return next;
				});
			}
		},
		[],
	);

	return (
		<>
		<main
			style={{
				width: "100%",
				minHeight: "100vh",
				padding: "24px",
				boxSizing: "border-box",
			}}
		>
			<MFlex gap="2xl" align="start" direction="column" justify="start">
				<MHeading mode="h1">Reports</MHeading>

				<MDataGrid
					width="100%"
					emptyMessage={
						<MFlex
							direction="column"
							align="center"
							justify="center"
							style={{ padding: "24px" }}
						>
							<MIconBugBeetle mode="regular" width={24} height={24} />
							<MText>No reports found</MText>
						</MFlex>
					}
					headers={[
						{
							field: "id",
							label: "ID",
							renderCell: (value) => value?.toString(),
						},
						{
							field: "created_at",
							label: "Date",
							renderCell: (value) =>
								value
									? new Date(value as string).toLocaleString()
									: "",
						},
						{
							field: "word",
							label: "Word",
							renderCell: (value) => (
								<MButton
									mode="tertiary"
									size="s"
									onClick={() => setSelectedWordId(Number(value))}
								>
									#{value?.toString()}
								</MButton>
							),
						},
						{
							field: "type",
							label: "Type",
							renderCell: (value) => (
								<MBadge mode={TYPE_BADGE_MODE[value as Report["type"]]}>
									{value as string}
								</MBadge>
							),
						},
						{
							field: "description",
							label: "Description",
							renderCell: (value) => (value as string) || "—",
						},
						{
							field: "status",
							label: "Status",
							renderCell: (value) => (
								<MBadge mode={STATUS_BADGE_MODE[value as Report["status"]]}>
									{value as string}
								</MBadge>
							),
							renderFilter: (props) => (
								<MSelect
									{...props}
									options={STATUS_OPTIONS}
									value={statusFilter}
									onChange={(e) => setStatusFilter(e.target.value)}
								/>
							),
						},
						{
							field: "id",
							key: "actions",
							label: "Actions",
							renderCell: (id) => (
								<MFlex direction="row" gap="s" align="center">
									<MButton
										mode="tertiary"
										size="s"
										title="Mark as reviewed"
										disabled={pendingUpdate.has(Number(id))}
										onClick={() =>
											handleStatusChange(Number(id), "reviewed")
										}
									>
										<MIconCheck mode="regular" width={16} height={16} />
									</MButton>
									<MButton
										mode="tertiary"
										size="s"
										title="Mark as resolved"
										disabled={pendingUpdate.has(Number(id))}
										onClick={() =>
											handleStatusChange(Number(id), "resolved")
										}
									>
										<MIconBugBeetle mode="regular" width={16} height={16} />
									</MButton>
									<MButton
										mode="tertiary"
										size="s"
										title="Delete"
										disabled={pendingDelete.has(Number(id))}
										onClick={() => handleDelete(Number(id))}
									>
										<MIconTrash mode="regular" width={16} height={16} />
									</MButton>
								</MFlex>
							),
						},
					]}
					pagination={{
						total,
						limit,
						offset,
						onNextPage: (newOffset, newLimit) => {
							setOffset(newOffset);
							setLimit(newLimit);
						},
						onPreviousPage: (newOffset, newLimit) => {
							setOffset(newOffset);
							setLimit(newLimit);
						},
						onRowsPerPageChange: (newLimit) => {
							setLimit(newLimit);
							setOffset(0);
						},
					}}
					rows={reports.map((r) => ({ ...r }))}
				/>
			</MFlex>
		</main>
		{selectedWordId !== null && (
			<WordDetailModal
				wordId={selectedWordId}
				onClose={() => setSelectedWordId(null)}
			/>
		)}
		</>
	);
}
