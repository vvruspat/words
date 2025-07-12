import { ApiProperty } from "@nestjs/swagger";
import type { PostWordRequest, PostWordResponse, Word } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordDto } from "../../entities/word.dto";

export class PostWordRequestDto implements PostWordRequest {
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: Word["created_at"];
	@ApiProperty({ type: String, format: "int64" })
	topic!: Word["topic"];
	@ApiProperty({ type: String, format: "int64" })
	catalog!: Word["catalog"];
	@ApiProperty({ type: String })
	language!: Word["language"];
}

export class PostWordResponseDto implements PostWordResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: WordDto, required: false })
	data?: Word;
	@ApiProperty({ required: false })
	error?: unknown;
}
