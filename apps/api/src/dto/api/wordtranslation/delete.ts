import { ApiProperty } from "@nestjs/swagger";
import type {
	DeleteWordTranslationRequest,
	DeleteWordTranslationResponse,
	WordsTranslation,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordsTranslationDto } from "../../entities/words-translation.dto";

export class DeleteWordTranslationRequestDto
	implements DeleteWordTranslationRequest
{
	@ApiProperty({ type: String, format: "int64" })
	id!: WordsTranslation["id"];
}

export class DeleteWordTranslationResponseDto
	implements DeleteWordTranslationResponse
{
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: WordsTranslationDto, required: false })
	data?: WordsTranslation;
	@ApiProperty({ required: false })
	error?: unknown;
}
