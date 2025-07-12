import type { ApiResponse } from "../../common/api-response";
import type { Topic } from "../../database";

export interface PostTopicRequest extends Omit<Topic, "id"> {}

export interface PostTopicResponse extends ApiResponse<Topic> {}
