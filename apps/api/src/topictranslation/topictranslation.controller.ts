import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	DeleteTopicTranslationResponseDto,
	GetTopicTranslationRequestDto,
	GetTopicTranslationResponseDto,
	GetTopicTranslationsResponseDto,
	PostTopicTranslationRequestDto,
	PostTopicTranslationResponseDto,
	PutTopicTranslationRequestDto,
	PutTopicTranslationResponseDto,
} from "~/dto";
import { TopicTranslationService } from "./topictranslation.service";

@ApiTags("topic-translation")
@Controller("topic-translation")
export class TopicTranslationController {
	constructor(
		private readonly topicTranslationService: TopicTranslationService,
	) {}

	@Get()
	@ApiOperation({ summary: "Get topic translations" })
	@ApiResponse({ status: 200, type: GetTopicTranslationsResponseDto })
	@ApiResponse({ status: 500, description: "Server error" })
	async get(
		@Query() query: GetTopicTranslationRequestDto,
	): Promise<GetTopicTranslationsResponseDto> {
		const { limit, offset, topics, ...filters } = query;

		const topicsArray = topics
			? topics
					.split(",")
					.map(Number)
					.filter((id) => !Number.isNaN(id))
			: undefined;
		const items = await this.topicTranslationService.findAll({
			topics: topicsArray,
			...filters,
		});
		const total = await this.topicTranslationService.count({
			topics: topicsArray,
			...filters,
		});

		return {
			items,
			total,
			limit: limit ?? 10,
			offset: offset ?? 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get topic translation by id" })
	@ApiResponse({ status: 200, type: GetTopicTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Topic translation not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetTopicTranslationResponseDto> {
		const entity = await this.topicTranslationService.findOne(id);

		if (!entity) {
			throw new NotFoundException({
				message: "Topic translation not found",
				status: 404,
				details: {},
			});
		}

		return {
			total: 1,
			offset: 0,
			limit: 1,
			items: [entity],
		};
	}

	@Post()
	@ApiOperation({ summary: "Create topic translation" })
	@ApiResponse({ status: 201, type: PostTopicTranslationResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostTopicTranslationRequestDto,
	): Promise<PostTopicTranslationResponseDto> {
		return await this.topicTranslationService.create(dto);
	}

	@Put()
	@ApiOperation({ summary: "Update topic translation" })
	@ApiBody({ type: PutTopicTranslationRequestDto })
	@ApiResponse({ status: 200, type: PutTopicTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Topic translation not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutTopicTranslationRequestDto,
	): Promise<PutTopicTranslationResponseDto> {
		const { id, ...rest } = dto;
		const updated = await this.topicTranslationService.update(id, rest);
		if (!updated) {
			throw new NotFoundException({
				message: "Topic translation not found",
				status: 404,
				details: {},
			});
		}
		return updated;
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete topic translation" })
	@ApiResponse({ status: 200, type: DeleteTopicTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Topic translation not found" })
	async remove(
		@Param("id", ParseIntPipe) id: number,
	): Promise<DeleteTopicTranslationResponseDto> {
		const entity = await this.topicTranslationService.findOne(id);
		if (!entity) {
			throw new NotFoundException({
				message: "Topic translation not found",
				status: 404,
				details: {},
			});
		}
		await this.topicTranslationService.remove(id);
		return { id };
	}
}
