import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	ApiSortingRequestDto,
	WordDto,
} from "~/dto/entities";

export class GetWordRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(WordDto),
	PartialType(ApiSortingRequestDto),
) {
	@ApiProperty({ type: String, required: false })
	translation?: string;

	@ApiProperty({
		type: Number,
		required: false,
		default: 0.3,
		description:
			"Trigram similarity threshold for word search (0–1). Lower values return more results.",
	})
	similarityThreshold?: number;
}

export class GetWordResponseDto extends ApiPaginatedResponseDto<WordDto> {
	@ApiProperty({
		type: [WordDto],
		description: "List of words",
	})
	items: WordDto[];
}

export class WordDuplicateGroupDto {
	@ApiProperty({ type: String })
	word: string;

	@ApiProperty({ type: String })
	language: string;

	@ApiProperty({ type: [WordDto] })
	items: WordDto[];
}

export class GetWordDuplicatesResponseDto {
	@ApiProperty({ type: [WordDuplicateGroupDto] })
	groups: WordDuplicateGroupDto[];

	@ApiProperty({ type: Number })
	total: number;

	@ApiProperty({ type: Number })
	limit: number;

	@ApiProperty({ type: Number })
	offset: number;
}
