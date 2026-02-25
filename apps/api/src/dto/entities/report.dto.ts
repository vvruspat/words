import { ApiProperty } from "@nestjs/swagger";
import type { Report, ReportStatus, ReportType } from "@vvruspat/words-types";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class ReportDto implements Report {
	@ApiProperty({ type: Number })
	@IsInt()
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	@IsString()
	created_at!: string;

	@ApiProperty({ type: Number })
	@IsInt()
	word!: number;

	@ApiProperty({ enum: ["word", "translation", "audio"] })
	@IsEnum(["word", "translation", "audio"])
	type!: ReportType;

	@ApiProperty({ type: "string", required: false })
	@IsString()
	@IsOptional()
	description?: string;

	@ApiProperty({ enum: ["new", "reviewed", "resolved"] })
	@IsEnum(["new", "reviewed", "resolved"])
	status!: ReportStatus;
}
