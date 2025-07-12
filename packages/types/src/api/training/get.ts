import type { PaginatedResponse } from "../../common/api-response";
import type { Training } from "../../database";

export interface GetTrainingRequest extends Partial<Training> {
	limit?: number;
	offset?: number;
}

export interface GetTrainingResponse extends PaginatedResponse<Training> {}
