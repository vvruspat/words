import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
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

export class GetWordsTranslationsRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(WordTranslationDto),
) {
	@ApiProperty({
		type: String,
		description: "Word ID or array of Word IDs",
		required: false,
		example: "1,2,3",
	})
	@IsOptional()
	@IsString()
	words?: string;
}

export class GetWordsTranslationsResponseDto extends ApiPaginatedResponseDto<WordTranslationDto> {
	@ApiProperty({
		type: [WordTranslationDto],
		description: "List of word translations",
	})
	items: WordTranslationDto[];
}
