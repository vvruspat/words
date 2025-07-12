import type { ApiResponse } from "../../common/api-response";
import type { Topic } from "../../database";

export interface PutTopicRequest extends Topic {}

export interface PutTopicResponse extends ApiResponse<Topic> {}
