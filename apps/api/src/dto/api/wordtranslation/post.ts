import { ApiProperty } from "@nestjs/swagger";
import type {
	PostWordTranslationRequest,
	PostWordTranslationResponse,
	WordsTranslation,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordsTranslationDto } from "../../entities/words-translation.dto";

export class PostWordTranslationRequestDto
	implements PostWordTranslationRequest
{
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: WordsTranslation["created_at"];

	@ApiProperty({ type: String, format: "int64" })
	word!: WordsTranslation["word"];

	@ApiProperty({ type: String })
	translation!: WordsTranslation["translation"];

	@ApiProperty({ type: String })
	language!: WordsTranslation["language"];
}

export class PostWordTranslationResponseDto
	implements PostWordTranslationResponse
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
