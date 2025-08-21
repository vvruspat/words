import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	WordDataDto,
} from "~/dto/entities";

export class GetWordRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(WordDataDto),
) {}

export class GetWordResponseDto extends ApiPaginatedResponseDto<WordDataDto> {
	@ApiProperty({
		type: [WordDataDto],
		description: "List of words",
	})
	items: WordDataDto[];
}
