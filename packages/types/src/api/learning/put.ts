import type { ApiResponse } from "../../common/api-response";
import type { Learning } from "../../database";

export interface PutLearningRequest extends Learning {}

export interface PutLearningResponse extends ApiResponse<Learning> {}
