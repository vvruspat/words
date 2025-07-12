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
	DeleteTrainingRequestDto,
	DeleteTrainingResponseDto,
} from "~/dto/api/training/delete";
import {
	GetTrainingRequestDto,
	GetTrainingResponseDto,
} from "~/dto/api/training/get";
import {
	PostTrainingRequestDto,
	PostTrainingResponseDto,
} from "~/dto/api/training/post";
import {
	PutTrainingRequestDto,
	PutTrainingResponseDto,
} from "~/dto/api/training/put";
import { TrainingService } from "./training.service";

@ApiTags("training")
@Controller("training")
export class TrainingController {
	constructor(private readonly trainingService: TrainingService) {}

	@Get()
	@ApiOperation({ summary: "Get all training records" })
	@ApiQuery({ type: GetTrainingRequestDto })
	@ApiResponse({ status: 200, type: GetTrainingResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetTrainingRequestDto,
	): Promise<GetTrainingResponseDto> {
		const entities = await this.trainingService.findAll(query);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get training by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetTrainingResponseDto })
	@ApiResponse({ status: 404, description: "Training not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetTrainingResponseDto> {
		const entity = await this.trainingService.findOne(id);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create training" })
	@ApiResponse({ status: 201, type: PostTrainingResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostTrainingRequestDto,
	): Promise<PostTrainingResponseDto> {
		const entity = await this.trainingService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Put()
	@ApiOperation({ summary: "Update training" })
	@ApiResponse({ status: 200, type: PutTrainingResponseDto })
	@ApiResponse({ status: 404, description: "Training not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutTrainingRequestDto,
	): Promise<PutTrainingResponseDto> {
		const entity = await this.trainingService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete training" })
	@ApiResponse({ status: 200, type: DeleteTrainingResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteTrainingRequestDto["id"],
	): Promise<DeleteTrainingResponseDto> {
		await this.trainingService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
