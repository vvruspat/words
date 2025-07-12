import { ApiProperty } from "@nestjs/swagger";
import type { PutTopicRequest, PutTopicResponse, Topic } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TopicDto } from "../../entities/topic.dto";

export class PutTopicRequestDto implements PutTopicRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Topic["id"];
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

export class PutTopicResponseDto implements PutTopicResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TopicDto, required: false })
	data?: Topic;
	@ApiProperty({ required: false })
	error?: unknown;
}
