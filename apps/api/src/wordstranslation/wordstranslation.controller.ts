import {
	Body,
	Controller,
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
import { AdminOnly } from "~/auth/admin-only.decorator";
import { CurrentUser } from "~/auth/current-user.decorator";
import {
	GetWordsTranslationsRequestDto,
	GetWordsTranslationsResponseDto,
	GetWordTranslationResponseDto,
	PostWordTranslationRequestDto,
	PostWordTranslationResponseDto,
	PutWordTranslationRequestDto,
	PutWordTranslationResponseDto,
} from "~/dto";
import type { UserEntity } from "~/user/user.entity";
import { WordTranslationService } from "./wordstranslation.service";

@ApiTags("words-translation")
@Controller("words-translation")
export class WordTranslationController {
	constructor(
		private readonly wordsTranslationService: WordTranslationService,
	) {}

	@Get()
	@ApiOperation({ summary: "Get words translations" })
	@ApiResponse({ status: 200, type: GetWordsTranslationsResponseDto })
	@ApiResponse({ status: 500, description: "Server error" })
	async get(
		@Query() query: GetWordsTranslationsRequestDto,
		@CurrentUser() user: UserEntity,
	): Promise<GetWordsTranslationsResponseDto> {
		const { limit, offset, words, ...filters } = query;

		const wordsArray = words
			? words
					.split(",")
					.map(Number)
					.filter((id) => !Number.isNaN(id))
			: undefined;
		const items = await this.wordsTranslationService.findAllVisible(
			{
				words: wordsArray,
				...filters,
			},
			user.id,
		);
		const total = await this.wordsTranslationService.countVisible(
			{
				words: wordsArray,
				...filters,
			},
			user.id,
		);

		return {
			items,
			total,
			limit: limit ?? 10,
			offset: offset ?? 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get words translation by id" })
	@ApiResponse({ status: 200, type: GetWordTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Words translation not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
		@CurrentUser() user: UserEntity,
	): Promise<GetWordTranslationResponseDto> {
		const entity = await this.wordsTranslationService.findOneVisible(
			id,
			user.id,
		);

		if (!entity) {
			throw new NotFoundException({
				message: "Words translation not found",
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
	@AdminOnly()
	@ApiOperation({ summary: "Create words translation" })
	@ApiResponse({ status: 201, type: PostWordTranslationResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostWordTranslationRequestDto,
	): Promise<PostWordTranslationResponseDto> {
		return await this.wordsTranslationService.create(dto);
	}

	@Put()
	@AdminOnly()
	@ApiOperation({ summary: "Update words translation" })
	@ApiBody({ type: PutWordTranslationRequestDto })
	@ApiResponse({ status: 200, type: PutWordTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Words translation not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutWordTranslationRequestDto,
	): Promise<PutWordTranslationResponseDto> {
		const { id, ...rest } = dto;
		const updated = await this.wordsTranslationService.update(id, rest);
		if (!updated) {
			throw new NotFoundException({
				message: "Words translation not found",
				status: 404,
				details: {},
			});
		}
		return updated;
	}
}
