import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	WordTranslationDto,
} from "~/dto/entities";

export class GetWordTranslationRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(WordTranslationDto),
) {}

export class GetWordTranslationResponseDto extends ApiPaginatedResponseDto<WordTranslationDto> {
	@ApiProperty({
		type: [WordTranslationDto],
		description: "List of word translations",
	})
	items: WordTranslationDto[];
}
