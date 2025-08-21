import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	LearningDto,
} from "~/dto/entities";

export class GetLearningRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(LearningDto),
) {}

export class GetLearningResponseDto extends ApiPaginatedResponseDto<LearningDto> {
	@ApiProperty({
		type: [LearningDto],
		description: "List of learning items",
	})
	items: LearningDto[];
}
