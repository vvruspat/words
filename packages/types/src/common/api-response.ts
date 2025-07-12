export enum ApiResponseStatus {
	SUCCESS = "success",
	ERROR = "error",
}

export interface ApiResponse<T> {
	status: ApiResponseStatus;
	message?: string;
	data?: T;
	error?: unknown;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	total: number;
	limit: number;
	offset: number;
}
