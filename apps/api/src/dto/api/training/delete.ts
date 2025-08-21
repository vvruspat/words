import { PickType } from "@nestjs/swagger";
import { TrainingDto } from "../../entities/training.dto";

export class DeleteTrainingRequestDto extends PickType(TrainingDto, [
	"id",
] as const) {}
export class DeleteTrainingResponseDto extends PickType(TrainingDto, [
	"id",
] as const) {}
