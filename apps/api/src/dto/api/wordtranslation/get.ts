import { ApiProperty } from "@nestjs/swagger";
import type {
	GetWordTranslationRequest,
	GetWordTranslationResponse,
	WordsTranslation,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordsTranslationDto } from "../../entities/words-translation.dto";

export class GetWordTranslationRequestDto implements GetWordTranslationRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: WordsTranslation["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: WordsTranslation["created_at"];
	@ApiProperty({ type: String, format: "int64", required: false })
	word?: WordsTranslation["word"];
	@ApiProperty({ type: String, required: false })
	translation?: WordsTranslation["translation"];
	@ApiProperty({ type: String, required: false })
	language?: WordsTranslation["language"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetWordTranslationResponseDto
	implements GetWordTranslationResponse
{
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [WordsTranslationDto], required: false })
	data?: WordsTranslation[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
