import { ApiProperty } from "@nestjs/swagger";
import type { WordsTranslation } from "@repo/types";

export class WordsTranslationDto implements WordsTranslation {
	@ApiProperty({ type: "string", format: "int64" })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string", format: "int64" })
	word!: number;

	@ApiProperty({ type: "string" })
	translation!: string;

	@ApiProperty({ type: "string" })
	language!: string;
}
