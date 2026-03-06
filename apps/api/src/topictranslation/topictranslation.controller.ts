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
import { IsArray, IsInt, IsString } from "class-validator";
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
import { TopicService } from "~/topic/topic.service";
import { TopicTranslationService } from "./topictranslation.service";

class TranslateTopicsRequestDto {
	@IsArray()
	@IsInt({ each: true })
	topicIds!: number[];
}

class TranslateUntranslatedTopicsRequestDto {
	@IsString()
	language!: string;
}

@ApiTags("topic-translation")
@Controller("topic-translation")
export class TopicTranslationController {
	constructor(
		private readonly topicTranslationService: TopicTranslationService,
		private readonly topicService: TopicService,
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

	@Post("translate")
	@ApiOperation({ summary: "Auto-translate topics via OpenAI" })
	@ApiBody({ type: TranslateTopicsRequestDto })
	@ApiResponse({ status: 201, description: "Translation job enqueued" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async translate(
		@Body() dto: TranslateTopicsRequestDto,
	): Promise<{ queued: boolean }> {
		const topics = await Promise.all(
			dto.topicIds.map((id) => this.topicService.findOne(id)),
		);
		const validTopics = topics.filter(Boolean);
		if (validTopics.length > 0) {
			await this.topicTranslationService.makeTranslations(validTopics);
		}
		return { queued: true };
	}

	@Post("translate-untranslated")
	@ApiOperation({
		summary: "Auto-translate all untranslated topics for a language",
	})
	@ApiBody({ type: TranslateUntranslatedTopicsRequestDto })
	@ApiResponse({ status: 201, description: "Translation job enqueued" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async translateUntranslated(
		@Body() dto: TranslateUntranslatedTopicsRequestDto,
	): Promise<{ queued: boolean }> {
		const allTopics = await this.topicService.findAll({
			language: dto.language,
			limit: 10000,
			offset: 0,
		});

		if (allTopics.length === 0) return { queued: false };

		const topicIds = allTopics.map((t) => t.id);
		const existingTranslations = await this.topicTranslationService.findAll({
			topics: topicIds,
		});
		const translatedTopicIds = new Set(
			existingTranslations.map((t) => t.topic),
		);
		const untranslatedTopics = allTopics.filter(
			(t) => !translatedTopicIds.has(t.id),
		);

		if (untranslatedTopics.length > 0) {
			await this.topicTranslationService.makeTranslations(untranslatedTopics);
		}

		return { queued: untranslatedTopics.length > 0 };
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
