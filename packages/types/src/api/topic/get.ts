import type { PaginatedResponse } from "../../common/api-response";
import type { Topic } from "../../database";

export interface GetTopicRequest extends Partial<Topic> {
	limit?: number;
	offset?: number;
}

export interface GetTopicResponse extends PaginatedResponse<Topic> {}
