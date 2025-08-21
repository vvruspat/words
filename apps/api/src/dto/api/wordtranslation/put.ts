import { PartialType } from "@nestjs/swagger";
import { WordTranslationDto } from "../../entities/words-translation.dto";

export class PutWordTranslationRequestDto extends PartialType(
	WordTranslationDto,
) {
	id!: number;
}
export class PutWordTranslationResponseDto extends WordTranslationDto {}
