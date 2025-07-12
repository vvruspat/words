import type { ApiResponse } from "../../common/api-response";
import type { Training } from "../../database";

export interface DeleteTrainingRequest {
	id: Training["id"];
}

export interface DeleteTrainingResponse extends ApiResponse<Training> {}
