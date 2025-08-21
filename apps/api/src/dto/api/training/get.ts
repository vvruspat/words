import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	TrainingDto,
} from "~/dto/entities";

export class GetTrainingRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(TrainingDto),
) {}

export class GetTrainingResponseDto extends ApiPaginatedResponseDto<TrainingDto> {
	@ApiProperty({
		type: [TrainingDto],
		description: "List of training items",
	})
	items: TrainingDto[];
}
