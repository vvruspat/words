import { PickType } from "@nestjs/swagger";
import { WordTranslationDto } from "../../entities/words-translation.dto";

export class DeleteWordTranslationRequestDto extends PickType(
	WordTranslationDto,
	["id"] as const,
) {}
export class DeleteWordTranslationResponseDto extends PickType(
	WordTranslationDto,
	["id"] as const,
) {}
