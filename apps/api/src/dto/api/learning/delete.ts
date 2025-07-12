import { ApiProperty } from "@nestjs/swagger";
import type {
	DeleteLearningRequest,
	DeleteLearningResponse,
	Learning,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { LearningDto } from "../../entities/learning.dto";

export class DeleteLearningRequestDto implements DeleteLearningRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: Learning["id"];
}

export class DeleteLearningResponseDto implements DeleteLearningResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: LearningDto, required: false })
	data?: Learning;
	@ApiProperty({ required: false })
	error?: unknown;
}
