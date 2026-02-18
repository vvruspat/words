import { ApiProperty } from "@nestjs/swagger";
import type { VocabCatalog } from "@repo/types";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class VocabCatalogDto implements VocabCatalog {
	@ApiProperty({ type: Number })
	@IsInt()
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	@IsString()
	created_at!: string;

	@ApiProperty({ type: Number })
	@IsInt()
	owner!: number;

	@ApiProperty({ type: "string" })
	@IsString()
	@IsNotEmpty()
	title!: string;

	@ApiProperty({ type: "string", required: false, nullable: true })
	@IsString()
	@IsOptional()
	description?: string | null;

	@ApiProperty({ type: "string" })
	@IsString()
	@IsNotEmpty()
	language!: string;

	@ApiProperty({ type: "string", required: false, nullable: true })
	@IsString()
	@IsOptional()
	image?: string | null;

	@ApiProperty({ type: Number, required: false })
	@IsInt()
	@IsOptional()
	wordsCount?: number;
}
