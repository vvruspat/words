import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	VocabCatalogDto,
} from "~/dto/entities";

export class GetVocabCatalogRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(VocabCatalogDto),
) {}

export class GetVocabCatalogResponseDto extends ApiPaginatedResponseDto<VocabCatalogDto> {
	@ApiProperty({
		type: [VocabCatalogDto],
		description: "List of vocabulary catalogs",
	})
	items: VocabCatalogDto[];
}
