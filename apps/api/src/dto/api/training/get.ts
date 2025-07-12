import { ApiProperty } from "@nestjs/swagger";
import type {
	GetTrainingRequest,
	GetTrainingResponse,
	Training,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TrainingDto } from "../../entities/training.dto";

export class GetTrainingRequestDto implements GetTrainingRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: Training["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: Training["created_at"];
	@ApiProperty({ type: String, required: false })
	name?: Training["name"];
	@ApiProperty({ type: String, required: false })
	title?: Training["title"];
	@ApiProperty({ type: String, required: false })
	description?: Training["description"];
	@ApiProperty({ type: String, required: false })
	image?: Training["image"];
	@ApiProperty({ type: Number, required: false })
	score?: Training["score"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetTrainingResponseDto implements GetTrainingResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [TrainingDto], required: false })
	data?: Training[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
