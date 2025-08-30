import { OmitType } from "@nestjs/swagger";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class PostVocabCatalogRequestDto extends OmitType(VocabCatalogDto, [
	"id",
	"created_at",
] as const) {}
export class PostVocabCatalogResponseDto extends VocabCatalogDto {}
