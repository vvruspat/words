import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	ReportDto,
} from "~/dto/entities";

export class GetReportRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(ReportDto),
) {}

export class GetReportResponseDto extends ApiPaginatedResponseDto<ReportDto> {
	@ApiProperty({
		type: [ReportDto],
		description: "List of reports",
	})
	items: ReportDto[];
}
