import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
	GetWordTranslationResponseDto,
	PostWordTranslationRequestDto,
	PostWordTranslationResponseDto,
} from "~/dto";
import { WordTranslationService } from "./wordstranslation.service";

@ApiTags("words-translation")
@Controller("words-translation")
export class WordTranslationController {
	constructor(
		private readonly wordsTranslationService: WordTranslationService,
	) {}

	@Get(":id")
	@ApiOperation({ summary: "Get words translation by id" })
	@ApiResponse({ status: 200, type: GetWordTranslationResponseDto })
	@ApiResponse({ status: 404, description: "Words translation not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetWordTranslationResponseDto> {
		const entity = await this.wordsTranslationService.findOne(id);

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
	@ApiOperation({ summary: "Create words translation" })
	@ApiResponse({ status: 201, type: PostWordTranslationResponseDto })

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostWordTranslationRequestDto,
	): Promise<PostWordTranslationResponseDto> {
		return await this.wordsTranslationService.create(dto);
	}
}
