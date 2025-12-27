import { ApiProperty } from "@nestjs/swagger";
import type { Topic } from "@repo/types";

export class TopicDto implements Topic {
	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string" })
	title!: string;

	@ApiProperty({ type: "string" })
	description!: string;

	@ApiProperty({ type: "string" })
	language!: string;

	@ApiProperty({ type: "string", required: false, nullable: true })
	image?: string | null;
}
