import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	TopicDto,
} from "~/dto/entities";

export class GetTopicRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(TopicDto),
) {}

export class GetTopicResponseDto extends ApiPaginatedResponseDto<TopicDto> {
	@ApiProperty({
		type: [TopicDto],
		description: "List of topics",
	})
	items: TopicDto[];
}
