import { PickType } from "@nestjs/swagger";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class DeleteVocabCatalogRequestDto extends PickType(VocabCatalogDto, [
	"id",
] as const) {}
export class DeleteVocabCatalogResponseDto extends PickType(VocabCatalogDto, [
	"id",
] as const) {}
