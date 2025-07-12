import { ApiProperty } from "@nestjs/swagger";
import type { PostTopicRequest, PostTopicResponse, Topic } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TopicDto } from "../../entities/topic.dto";

export class PostTopicRequestDto implements PostTopicRequest {
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: Topic["created_at"];
	@ApiProperty({ type: String })
	title!: Topic["title"];
	@ApiProperty({ type: String })
	description!: Topic["description"];
	@ApiProperty({ type: String, format: "int64" })
	catalog!: Topic["catalog"];
	@ApiProperty({ type: String, required: false })
	image?: Topic["image"];
}

export class PostTopicResponseDto implements PostTopicResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TopicDto, required: false })
	data?: Topic;
	@ApiProperty({ required: false })
	error?: unknown;
}
