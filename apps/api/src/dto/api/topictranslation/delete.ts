import { PickType } from "@nestjs/swagger";
import { TopicTranslationDto } from "../../entities/topic-translation.dto";

export class DeleteTopicTranslationRequestDto extends PickType(
	TopicTranslationDto,
	["id"] as const,
) {}
export class DeleteTopicTranslationResponseDto extends PickType(
	TopicTranslationDto,
	["id"] as const,
) {}
