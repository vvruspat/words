import { ApiProperty } from "@nestjs/swagger";
import type { Training } from "@vvruspat/words-types";

export class TrainingDto implements Training {
	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string" })
	name!: string;

	@ApiProperty({ type: "string" })
	title!: string;

	@ApiProperty({ type: "string" })
	description!: string;

	@ApiProperty({ type: "string" })
	image!: string;

	@ApiProperty({ type: "number" })
	score!: number;
}
