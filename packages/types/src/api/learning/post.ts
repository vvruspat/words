import type { ApiResponse } from "../../common/api-response";
import type { Learning } from "../../database";

export interface PostLearningRequest extends Omit<Learning, "id"> {}

export interface PostLearningResponse extends ApiResponse<Learning> {}
