import { ApiProperty } from "@nestjs/swagger";
import type {
	Learning,
	PutLearningRequest,
	PutLearningResponse,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { LearningDto } from "../../entities/learning.dto";

export class PutLearningRequestDto implements PutLearningRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Learning["id"];
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: Learning["created_at"];
	@ApiProperty({ type: String, format: "int64" })
	user!: Learning["user"];
	@ApiProperty({ type: String, format: "int64" })
	word!: Learning["word"];
	@ApiProperty({ type: Number })
	score!: Learning["score"];
	@ApiProperty({ type: String, format: "date-time" })
	last_review!: Learning["last_review"];
	@ApiProperty({ type: String, format: "int64" })
	training!: Learning["training"];
	@ApiProperty({ type: String, format: "int64" })
	translation!: Learning["translation"];
}

export class PutLearningResponseDto implements PutLearningResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: LearningDto, required: false })
	data?: Learning;
	@ApiProperty({ required: false })
	error?: unknown;
}
