import { ApiProperty } from "@nestjs/swagger";
import type { VocabCatalog } from "@repo/types";

export class VocabCatalogDto implements VocabCatalog {
	@ApiProperty({ type: "string", format: "int64" })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string", format: "int64" })
	owner!: number;

	@ApiProperty({ type: "string" })
	title!: string;

	@ApiProperty({ type: "string", required: false, nullable: true })
	description?: string | null;

	@ApiProperty({ type: "string" })
	language!: string;

	@ApiProperty({ type: "string", required: false, nullable: true })
	image?: string | null;
}
