import { PartialType } from "@nestjs/swagger";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class PutVocabCatalogRequestDto extends PartialType(VocabCatalogDto) {
	id!: number;
}
export class PutVocabCatalogResponseDto extends VocabCatalogDto {}
