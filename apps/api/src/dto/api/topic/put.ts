import { PartialType } from "@nestjs/swagger";
import { TopicDto } from "../../entities/topic.dto";

export class PutTopicRequestDto extends PartialType(TopicDto) {
	id!: number;
}
export class PutTopicResponseDto extends TopicDto {}
