import { PickType } from "@nestjs/swagger";
import { ReportDto } from "~/dto/entities";

export class PutReportRequestDto extends PickType(ReportDto, [
	"id",
	"status",
] as const) {}

export class PutReportResponseDto extends ReportDto {}
