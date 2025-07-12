import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { WordsTranslationDto } from "~/dto";
import { WordsTranslationService } from "./wordstranslation.service";

@ApiTags("words-translation")
@Controller("words-translation")
export class WordsTranslationController {
	constructor(
		private readonly wordsTranslationService: WordsTranslationService,
	) {}

	@Get(":id")
	@ApiOperation({ summary: "Get words translation by id" })
	@ApiResponse({ status: 200, type: WordsTranslationDto })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<WordsTranslationDto> {
		const entity = await this.wordsTranslationService.findOne(id);
		return entity as WordsTranslationDto;
	}

	@Post()
	@ApiOperation({ summary: "Create words translation" })
	@ApiResponse({ status: 201, type: WordsTranslationDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(@Body() dto: WordsTranslationDto): Promise<WordsTranslationDto> {
		const entity = await this.wordsTranslationService.create(dto);
		return entity as WordsTranslationDto;
	}
}
