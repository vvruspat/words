import { ApiProperty } from "@nestjs/swagger";
import type {
	GetWordRequest,
	GetWordResponse,
	Word,
	WordData,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { WordDataDto } from "../../entities/word.dto";

export class GetWordRequestDto implements GetWordRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: Word["id"];

	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: Word["created_at"];

	@ApiProperty({ type: String, format: "int64", required: false })
	topic?: Word["topic"];

	@ApiProperty({ type: String, format: "int64", required: false })
	catalog?: Word["catalog"];

	@ApiProperty({ type: String, required: false })
	language?: Word["language"];

	@ApiProperty({ type: Number, required: false })
	limit?: number;

	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetWordResponseDto implements GetWordResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;

	@ApiProperty({ type: String, required: false })
	message?: string;

	@ApiProperty({ type: [WordDataDto], required: false })
	data?: WordData[];

	@ApiProperty({ required: false })
	error?: unknown;

	@ApiProperty({ type: Number })
	total!: number;

	@ApiProperty({ type: Number })
	limit!: number;

	@ApiProperty({ type: Number })
	offset!: number;
}
