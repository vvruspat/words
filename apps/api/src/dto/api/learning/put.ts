import { ApiProperty, PartialType } from "@nestjs/swagger";
import type { Learning } from "@repo/types";
import { LearningDto } from "../../entities/learning.dto";

export class PutLearningRequestDto extends PartialType(LearningDto) {
	@ApiProperty({ type: String, format: "int64" })
	id!: Learning["id"];
}

export class PutLearningResponseDto extends LearningDto {}
