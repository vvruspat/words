import { OmitType } from "@nestjs/swagger";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class PostVocabCatalogRequestDto extends OmitType(VocabCatalogDto, [
	"id",
] as const) {}
export class PostVocabCatalogResponseDto extends VocabCatalogDto {}
