import type { ApiResponse } from "../../common/api-response";
import type { Training } from "../../database";

export interface PutTrainingRequest extends Training {}

export interface PutTrainingResponse extends ApiResponse<Training> {}
