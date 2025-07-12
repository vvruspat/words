import { ApiProperty } from "@nestjs/swagger";
import type {
	PutTrainingRequest,
	PutTrainingResponse,
	Training,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TrainingDto } from "../../entities/training.dto";

export class PutTrainingRequestDto implements PutTrainingRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Training["id"];
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

export class PutTrainingResponseDto implements PutTrainingResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TrainingDto, required: false })
	data?: Training;
	@ApiProperty({ required: false })
	error?: unknown;
}
