import { PartialType } from "@nestjs/swagger";
import { TopicTranslationDto } from "../../entities/topic-translation.dto";

export class PutTopicTranslationRequestDto extends PartialType(
	TopicTranslationDto,
) {
	id!: number;
}
export class PutTopicTranslationResponseDto extends TopicTranslationDto {}
