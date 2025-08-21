import { PickType } from "@nestjs/swagger";
import { LearningDto } from "~/dto/entities";

export class DeleteLearningRequestDto extends PickType(LearningDto, [
	"id",
] as const) {}

export class DeleteLearningResponseDto extends PickType(LearningDto, [
	"id",
] as const) {}
