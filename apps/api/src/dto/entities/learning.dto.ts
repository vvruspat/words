import { ApiProperty } from "@nestjs/swagger";
import type {
	Learning,
	Training,
	WordData,
	WordsTranslation,
} from "@repo/types";
import { TrainingDto } from "./training.dto";
import { WordDataDto } from "./word.dto";
import { WordsTranslationDto } from "./words-translation.dto";

export class LearningDto implements Learning {
	@ApiProperty({ type: "string", format: "int64" })
	id!: number;

	@ApiProperty({
		type: "string",
		format: "date-time",
		description: "timestamp with time zone",
	})
	created_at!: string;

	@ApiProperty({ type: "string", format: "int64" })
	user!: number;

	@ApiProperty({ type: "string", format: "int64" })
	word!: number;

	@ApiProperty({ type: "number" })
	score!: number;

	@ApiProperty({
		type: "string",
		format: "date-time",
		description: "timestamp without time zone",
	})
	last_review!: string;

	@ApiProperty({ type: "string", format: "int64" })
	training!: number;

	@ApiProperty({ type: "string", format: "int64" })
	translation!: number;
}

export class LearningDataDto extends LearningDto {
	@ApiProperty({ type: WordDataDto })
	wordData!: WordData;

	@ApiProperty({ type: TrainingDto })
	trainingData!: Training;

	@ApiProperty({ type: WordsTranslationDto })
	translationData!: WordsTranslation;
}
