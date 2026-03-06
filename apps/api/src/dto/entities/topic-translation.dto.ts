import { ApiProperty } from "@nestjs/swagger";
import type { TopicTranslation } from "@vvruspat/words-types";

export class TopicTranslationDto implements TopicTranslation {
	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: Number })
	topic!: number;

	@ApiProperty({ type: "string" })
	translation!: string;

	@ApiProperty({ type: "string" })
	language!: string;
}
