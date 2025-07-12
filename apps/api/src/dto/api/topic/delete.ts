import { ApiProperty } from "@nestjs/swagger";
import type {
	DeleteTopicRequest,
	DeleteTopicResponse,
	Topic,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TopicDto } from "../../entities/topic.dto";

export class DeleteTopicRequestDto implements DeleteTopicRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Topic["id"];
}

export class DeleteTopicResponseDto implements DeleteTopicResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TopicDto, required: false })
	data?: Topic;
	@ApiProperty({ required: false })
	error?: unknown;
}
