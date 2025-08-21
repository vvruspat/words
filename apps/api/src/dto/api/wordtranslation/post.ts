import { OmitType } from "@nestjs/swagger";
import { WordTranslationDto } from "../../entities/words-translation.dto";

export class PostWordTranslationRequestDto extends OmitType(
	WordTranslationDto,
	["id"] as const,
) {}
export class PostWordTranslationResponseDto extends WordTranslationDto {}
