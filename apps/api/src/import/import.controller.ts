import {
	Body,
	Controller,
	Post,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	PostImportTopicsRequestDto,
	PostImportTopicsResponseDto,
} from "../dto";
import { ImportService } from "./import.service";

@ApiTags("import")
@Controller("import")
export class ImportController {
	constructor(private readonly importService: ImportService) {}

	@Post("topics")
	@ApiOperation({ summary: "Import topics with word generation" })
	@ApiBody({ type: PostImportTopicsRequestDto })
	@ApiResponse({ status: 201, type: PostImportTopicsResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async importTopics(
		@Body() dto: PostImportTopicsRequestDto,
	): Promise<PostImportTopicsResponseDto> {
		return this.importService.importTopics(dto);
	}
}
