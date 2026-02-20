import { ApiProperty } from "@nestjs/swagger";
import type { WordTranslation } from "@vvruspat/words-types";

export class WordTranslationDto implements WordTranslation {
	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: Number })
	word!: number;

	@ApiProperty({ type: "string" })
	translation!: string;

	@ApiProperty({ type: "string" })
	language!: string;
}
