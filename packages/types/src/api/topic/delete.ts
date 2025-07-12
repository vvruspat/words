import type { ApiResponse } from "../../common/api-response";
import type { Topic } from "../../database";

export interface DeleteTopicRequest {
	id: Topic["id"];
}

export interface DeleteTopicResponse extends ApiResponse<Topic> {}
