import type { PaginatedResponse } from "../../common/api-response";
import type { Learning, LearningData } from "../../database";

export interface GetLearningRequest extends Partial<Learning> {
	limit?: number;
	offset?: number;
}

export interface GetLearningResponse extends PaginatedResponse<LearningData> {}
