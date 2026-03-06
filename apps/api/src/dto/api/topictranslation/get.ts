import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	TopicTranslationDto,
} from "~/dto/entities";

export class GetTopicTranslationRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(TopicTranslationDto),
) {
	@ApiProperty({
		type: String,
		description: "Topic ID or array of Topic IDs",
		required: false,
		example: "1,2,3",
	})
	@IsOptional()
	@IsString()
	topics?: string;
}

export class GetTopicTranslationsResponseDto extends ApiPaginatedResponseDto<TopicTranslationDto> {
	@ApiProperty({
		type: [TopicTranslationDto],
		description: "List of topic translations",
	})
	items: TopicTranslationDto[];
}

export class GetTopicTranslationResponseDto extends ApiPaginatedResponseDto<TopicTranslationDto> {
	@ApiProperty({
		type: [TopicTranslationDto],
		description: "List of topic translations",
	})
	items: TopicTranslationDto[];
}
