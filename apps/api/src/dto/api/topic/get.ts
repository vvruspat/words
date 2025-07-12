import { ApiProperty } from "@nestjs/swagger";
import type { GetTopicRequest, GetTopicResponse, Topic } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TopicDto } from "../../entities/topic.dto";

export class GetTopicRequestDto implements GetTopicRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: Topic["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: Topic["created_at"];
	@ApiProperty({ type: String, required: false })
	title?: Topic["title"];
	@ApiProperty({ type: String, required: false })
	description?: Topic["description"];
	@ApiProperty({ type: String, format: "int64", required: false })
	catalog?: Topic["catalog"];
	@ApiProperty({ type: String, required: false })
	image?: Topic["image"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetTopicResponseDto implements GetTopicResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [TopicDto], required: false })
	data?: Topic[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
