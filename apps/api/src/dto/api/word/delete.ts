import { ApiProperty } from "@nestjs/swagger";
import type { DeleteWordRequest, DeleteWordResponse, Word } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordDto } from "../../entities/word.dto";

export class DeleteWordRequestDto implements DeleteWordRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Word["id"];
}

export class DeleteWordResponseDto implements DeleteWordResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: WordDto, required: false })
	data?: Word;
	@ApiProperty({ required: false })
	error?: unknown;
}
