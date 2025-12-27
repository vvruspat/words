export interface ApiPaginationRequest {
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
}
