import { PartialType } from "@nestjs/swagger";
import { TrainingDto } from "../../entities/training.dto";

export class PutTrainingRequestDto extends PartialType(TrainingDto) {
	id!: number;
}
export class PutTrainingResponseDto extends TrainingDto {}
