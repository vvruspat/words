import type { ApiResponse } from "../../common/api-response";
import type { Learning } from "../../database";

export interface DeleteLearningRequest {
	id: Learning["id"];
}

export interface DeleteLearningResponse extends ApiResponse<Learning> {}
