import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "~/auth/current-user.decorator";
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
import type { UserEntity } from "~/user/user.entity";
import { LearningService } from "./learning.service";

@ApiTags("learning")
@Controller("learning")
export class LearningController {
	constructor(private readonly learningService: LearningService) {}

	@Get()
	@ApiOperation({ summary: "Get all learning records" })
	@ApiResponse({ status: 200, type: GetLearningResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetLearningRequestDto,
		@CurrentUser() user: UserEntity,
	): Promise<GetLearningResponseDto> {
		const entities = await this.learningService.findAll({
			...query,
			user: user.id,
		});
		return {
			items: entities,
			total: entities.length,
			limit: query.limit ?? 10,
			offset: query.offset ?? 0,
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
		@CurrentUser() user: UserEntity,
	): Promise<GetLearningResponseDto> {
		const entity = await this.learningService.findOne(id);
		if (entity && entity.user !== user.id) {
			throw new ForbiddenException("Learning record belongs to another user");
		}
		return {
			items: entity ? [entity] : [],
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
		@CurrentUser() user: UserEntity,
	): Promise<PostLearningResponseDto> {
		return await this.learningService.create({ ...dto, user: user.id });
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
		@CurrentUser() user: UserEntity,
	): Promise<PutLearningResponseDto> {
		const existing = await this.learningService.findOne(dto.id);
		if (!existing || existing.user !== user.id) {
			throw new ForbiddenException("Learning record belongs to another user");
		}
		return await this.learningService.update(dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete learning" })
	@ApiResponse({ status: 200, type: DeleteLearningResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteLearningRequestDto["id"],
		@CurrentUser() user: UserEntity,
	): Promise<DeleteLearningResponseDto> {
		const existing = await this.learningService.findOne(id);
		if (!existing || existing.user !== user.id) {
			throw new ForbiddenException("Learning record belongs to another user");
		}
		await this.learningService.remove(id);
		return { id };
	}
}
