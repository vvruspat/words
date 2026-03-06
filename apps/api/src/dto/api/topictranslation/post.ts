import { OmitType } from "@nestjs/swagger";
import { TopicTranslationDto } from "../../entities/topic-translation.dto";

export class PostTopicTranslationRequestDto extends OmitType(
	TopicTranslationDto,
	["id"] as const,
) {}
export class PostTopicTranslationResponseDto extends TopicTranslationDto {}
