import { ApiProperty } from "@nestjs/swagger";
import type {
	PutWordTranslationRequest,
	PutWordTranslationResponse,
	WordsTranslation,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordsTranslationDto } from "../../entities/words-translation.dto";

export class PutWordTranslationRequestDto implements PutWordTranslationRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: WordsTranslation["id"];
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: WordsTranslation["created_at"];
	@ApiProperty({ type: String, format: "int64" })
	word!: WordsTranslation["word"];
	@ApiProperty({ type: String })
	translation!: WordsTranslation["translation"];
	@ApiProperty({ type: String })
	language!: WordsTranslation["language"];
}

export class PutWordTranslationResponseDto
	implements PutWordTranslationResponse
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
