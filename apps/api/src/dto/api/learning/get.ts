import { ApiProperty } from "@nestjs/swagger";
import type {
	GetLearningRequest,
	GetLearningResponse,
	Learning,
	LearningData,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { LearningDataDto } from "../../entities/learning.dto";

export class GetLearningRequestDto implements GetLearningRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: Learning["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: Learning["created_at"];
	@ApiProperty({ type: String, format: "int64", required: false })
	user?: Learning["user"];
	@ApiProperty({ type: String, format: "int64", required: false })
	word?: Learning["word"];
	@ApiProperty({ type: Number, required: false })
	score?: Learning["score"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	last_review?: Learning["last_review"];
	@ApiProperty({ type: String, format: "int64", required: false })
	training?: Learning["training"];
	@ApiProperty({ type: String, format: "int64", required: false })
	translation?: Learning["translation"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetLearningResponseDto implements GetLearningResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [LearningDataDto], required: false })
	data?: LearningData[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
