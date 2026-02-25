import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import {
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import {
	type DeleteReportRequestDto,
	DeleteReportResponseDto,
	GetReportRequestDto,
	GetReportResponseDto,
	PostReportRequestDto,
	PostReportResponseDto,
	PutReportRequestDto,
	PutReportResponseDto,
} from "~/dto";
import { ReportService } from "./report.service";

@ApiTags("report")
@Controller("report")
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@Get("stats")
	@ApiOperation({ summary: "Get report statistics by status" })
	@ApiResponse({ status: 200 })
	async getStats() {
		return await this.reportService.findStats();
	}

	@Get()
	@ApiOperation({ summary: "Get all reports" })
	@ApiResponse({ status: 200, type: GetReportResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetReportRequestDto,
	): Promise<GetReportResponseDto> {
		const [items, total] = await this.reportService.findAll(query);
		return {
			items,
			total,
			limit: query.limit ?? 10,
			offset: query.offset ?? 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create a report" })
	@ApiBody({ type: PostReportRequestDto })
	@ApiResponse({ status: 201, type: PostReportResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostReportRequestDto,
	): Promise<PostReportResponseDto> {
		return await this.reportService.create(dto);
	}

	@Put()
	@ApiOperation({ summary: "Update report status" })
	@ApiBody({ type: PutReportRequestDto })
	@ApiResponse({ status: 200, type: PutReportResponseDto })
	@ApiResponse({ status: 404, description: "Report not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutReportRequestDto,
	): Promise<PutReportResponseDto> {
		return await this.reportService.update(dto.id, dto.status);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete report" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: DeleteReportResponseDto })
	@ApiResponse({ status: 500, description: "Server error" })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteReportRequestDto["id"],
	): Promise<DeleteReportResponseDto> {
		await this.reportService.remove(id);
		return { id };
	}
}
