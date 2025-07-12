import { ApiProperty } from "@nestjs/swagger";
import type {
	PostTrainingRequest,
	PostTrainingResponse,
	Training,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TrainingDto } from "../../entities/training.dto";

export class PostTrainingRequestDto implements PostTrainingRequest {
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: Training["created_at"];
	@ApiProperty({ type: String })
	name!: Training["name"];
	@ApiProperty({ type: String })
	title!: Training["title"];
	@ApiProperty({ type: String })
	description!: Training["description"];
	@ApiProperty({ type: String })
	image!: Training["image"];
	@ApiProperty({ type: Number })
	score!: Training["score"];
}

export class PostTrainingResponseDto implements PostTrainingResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TrainingDto, required: false })
	data?: Training;
	@ApiProperty({ required: false })
	error?: unknown;
}
