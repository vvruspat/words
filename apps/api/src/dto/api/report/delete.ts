import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class DeleteReportRequestDto {
	@ApiProperty({ type: Number })
	@IsInt()
	id!: number;
}

export class DeleteReportResponseDto {
	@ApiProperty({ type: Number })
	id!: number;
}
