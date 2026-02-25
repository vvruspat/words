import { OmitType } from "@nestjs/swagger";
import { ReportDto } from "~/dto/entities";

export class PostReportRequestDto extends OmitType(ReportDto, [
	"id",
	"created_at",
	"status",
] as const) {}

export class PostReportResponseDto extends ReportDto {}
