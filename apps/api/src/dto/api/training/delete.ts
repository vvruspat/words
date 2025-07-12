import { ApiProperty } from "@nestjs/swagger";
import type {
	DeleteTrainingRequest,
	DeleteTrainingResponse,
	Training,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { TrainingDto } from "../../entities/training.dto";

export class DeleteTrainingRequestDto implements DeleteTrainingRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Training["id"];
}

export class DeleteTrainingResponseDto implements DeleteTrainingResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: TrainingDto, required: false })
	data?: Training;
	@ApiProperty({ required: false })
	error?: unknown;
}
