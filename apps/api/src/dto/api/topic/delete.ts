import { PickType } from "@nestjs/swagger";
import { TopicDto } from "../../entities/topic.dto";

export class DeleteTopicRequestDto extends PickType(TopicDto, [
	"id",
] as const) {}
export class DeleteTopicResponseDto extends PickType(TopicDto, [
	"id",
] as const) {}
