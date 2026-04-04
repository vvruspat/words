import { ApiProperty } from "@nestjs/swagger";
import type {
	Learning,
	WordData,
	WordTranslation,
} from "@vvruspat/words-types";
import { WordDataDto } from "./word.dto";
import { WordTranslationDto } from "./words-translation.dto";

export class LearningDto implements Learning {
	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({
		type: "string",
		format: "date-time",
		description: "timestamp with time zone",
	})
	created_at!: string;

	@ApiProperty({ type: Number })
	user!: number;

	@ApiProperty({ type: Number })
	word!: number;

	@ApiProperty({ type: "number" })
	score!: number;

	@ApiProperty({
		type: "string",
		format: "date-time",
		description: "timestamp without time zone",
	})
	last_review!: string;

	@ApiProperty({ type: String })
	training!: string;

	@ApiProperty({ type: Number })
	translation!: number;
}

export class LearningDataDto extends LearningDto {
	@ApiProperty({ type: WordDataDto })
	wordData!: WordData;

	@ApiProperty({ type: WordTranslationDto })
	translationData!: WordTranslation;
}
