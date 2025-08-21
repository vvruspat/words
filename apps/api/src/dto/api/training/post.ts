import { OmitType } from "@nestjs/swagger";
import { TrainingDto } from "../../entities/training.dto";

export class PostTrainingRequestDto extends OmitType(TrainingDto, [
	"id",
] as const) {}
export class PostTrainingResponseDto extends TrainingDto {}
