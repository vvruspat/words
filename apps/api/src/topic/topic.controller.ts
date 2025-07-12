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
import { ApiResponseStatus, GetTopicResponse } from "@repo/types";
import {
	DeleteTopicRequestDto,
	DeleteTopicResponseDto,
	GetTopicRequestDto,
	GetTopicResponseDto,
	PostTopicRequestDto,
	PostTopicResponseDto,
	PutTopicRequestDto,
	PutTopicResponseDto,
} from "~/dto";
import { TopicService } from "./topic.service";

@ApiTags("topic")
@Controller("topic")
export class TopicController {
	constructor(private readonly topicService: TopicService) {}

	@Get()
	@ApiOperation({ summary: "Get all topics" })
	@ApiQuery({ type: GetTopicRequestDto })
	@ApiResponse({ status: 200, type: GetTopicResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(@Query() query: GetTopicRequestDto): Promise<GetTopicResponse> {
		const entities = await this.topicService.findAll(query);

		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get topic by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetTopicResponseDto })
	@ApiResponse({ status: 404, description: "Topic not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetTopicResponseDto> {
		const entity = await this.topicService.findOne(id);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create topic" })
	@ApiResponse({ status: 201, type: PostTopicResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostTopicRequestDto,
	): Promise<PostTopicResponseDto> {
		const entity = await this.topicService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Put()
	@ApiOperation({ summary: "Update topic" })
	@ApiResponse({ status: 200, type: PutTopicResponseDto })
	@ApiResponse({ status: 404, description: "Topic not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(@Body() dto: PutTopicRequestDto): Promise<PutTopicResponseDto> {
		const entity = await this.topicService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete topic" })
	@ApiResponse({ status: 200, type: DeleteTopicResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteTopicRequestDto["id"],
	): Promise<DeleteTopicResponseDto> {
		await this.topicService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
