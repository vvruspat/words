import { OmitType } from "@nestjs/swagger";
import { TopicDto } from "../../entities/topic.dto";

export class PostTopicRequestDto extends OmitType(TopicDto, [
	"id",
	"created_at",
] as const) {}
export class PostTopicResponseDto extends TopicDto {}
