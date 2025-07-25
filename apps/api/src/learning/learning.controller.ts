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
	DeleteLearningRequestDto,
	DeleteLearningResponseDto,
} from "~/dto/api/learning/delete";
import {
	GetLearningRequestDto,
	GetLearningResponseDto,
} from "~/dto/api/learning/get";
import {
	PostLearningRequestDto,
	PostLearningResponseDto,
} from "~/dto/api/learning/post";
import {
	PutLearningRequestDto,
	PutLearningResponseDto,
} from "~/dto/api/learning/put";
import { LearningService } from "./learning.service";

@ApiTags("learning")
@Controller("learning")
export class LearningController {
	constructor(private readonly learningService: LearningService) {}

	@Get()
	@ApiOperation({ summary: "Get all learning records" })
	@ApiQuery({ type: GetLearningRequestDto })
	@ApiResponse({ status: 200, type: GetLearningResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetLearningRequestDto,
	): Promise<GetLearningResponseDto> {
		const entities = await this.learningService.findAll(query);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get learning by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetLearningResponseDto })
	@ApiResponse({ status: 404, description: "Learning not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetLearningResponseDto> {
		const entity = await this.learningService.findOne(id);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create learning" })
	@ApiResponse({ status: 201, type: PostLearningResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostLearningRequestDto,
	): Promise<PostLearningResponseDto> {
		const entity = await this.learningService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Put()
	@ApiOperation({ summary: "Update learning" })
	@ApiResponse({ status: 200, type: PutLearningResponseDto })
	@ApiResponse({ status: 404, description: "Learning not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutLearningRequestDto,
	): Promise<PutLearningResponseDto> {
		const entity = await this.learningService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete learning" })
	@ApiResponse({ status: 200, type: DeleteLearningResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteLearningRequestDto["id"],
	): Promise<DeleteLearningResponseDto> {
		await this.learningService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
