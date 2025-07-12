import type { ApiResponse } from "../../common/api-response";
import type { Training } from "../../database";

export interface PostTrainingRequest extends Omit<Training, "id"> {}

export interface PostTrainingResponse extends ApiResponse<Training> {}
