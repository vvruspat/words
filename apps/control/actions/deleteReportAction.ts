"use server";

const server = process.env.API_SERVER;

export async function deleteReportAction(id: number): Promise<void> {
	const res = await fetch(`${server}/report/${id}`, {
		method: "DELETE",
	});

	if (!res.ok) {
		throw new Error(`Failed to delete report: ${res.status}`);
	}
}
