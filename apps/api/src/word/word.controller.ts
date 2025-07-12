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
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { ApiResponseStatus } from "@repo/types";
import {
	DeleteWordRequestDto,
	DeleteWordResponseDto,
	GetWordRequestDto,
	GetWordResponseDto,
	PostWordRequestDto,
	PostWordResponseDto,
	PutWordRequestDto,
	PutWordResponseDto,
} from "~/dto/api/word";
import { WordService } from "./word.service";

@ApiTags("word")
@Controller("word")
export class WordController {
	constructor(private readonly wordService: WordService) {}

	@Get()
	@ApiOperation({ summary: "Get all words" })
	@ApiQuery({ type: GetWordRequestDto })
	@ApiResponse({ status: 200, type: GetWordResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(@Query() query: GetWordRequestDto): Promise<GetWordResponseDto> {
		const entities = await this.wordService.findAll(query);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get word by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetWordResponseDto })
	@ApiResponse({ status: 404, description: "Word not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetWordResponseDto> {
		const entity = await this.wordService.findOne(id);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create word" })
	@ApiResponse({ status: 201, type: PostWordResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(@Body() dto: PostWordRequestDto): Promise<PostWordResponseDto> {
		const entity = await this.wordService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Put()
	@ApiOperation({ summary: "Update word" })
	@ApiResponse({ status: 200, type: PutWordResponseDto })
	@ApiResponse({ status: 404, description: "Word not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(@Body() dto: PutWordRequestDto): Promise<PutWordResponseDto> {
		const entity = await this.wordService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete word" })
	@ApiResponse({ status: 200, type: DeleteWordResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteWordRequestDto["id"],
	): Promise<DeleteWordResponseDto> {
		await this.wordService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
