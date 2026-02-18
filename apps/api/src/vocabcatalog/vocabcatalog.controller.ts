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
	ApiBody,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { DeleteVocabCatalogResponseDto } from "~/dto/api/vocabcatalog/delete";
import {
	GetVocabCatalogRequestDto,
	GetVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/get";
import {
	PostVocabCatalogRequestDto,
	PostVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/post";
import {
	PutVocabCatalogRequestDto,
	PutVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/put";
import { VocabCatalogService } from "./vocabcatalog.service";

@ApiTags("vocabcatalog")
@Controller("vocabcatalog")
export class VocabCatalogController {
	constructor(private readonly vocabCatalogService: VocabCatalogService) {}

	@Get()
	@ApiOperation({ summary: "Get all vocab catalogs" })
	@ApiResponse({ status: 200, type: GetVocabCatalogResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetVocabCatalogRequestDto,
	): Promise<GetVocabCatalogResponseDto> {
		const entities = await this.vocabCatalogService.findAll(query);
		const counts = await this.vocabCatalogService.getWordsCountByCatalogIds(
			entities.map((catalog) => catalog.id),
			query.language,
		);

		return {
			items: entities.map((catalog) => ({
				...catalog,
				wordsCount: counts.get(catalog.id) ?? 0,
			})),
			total: entities.length,
			limit: query.limit ?? 10,
			offset: query.offset ?? 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get vocab catalog by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetVocabCatalogResponseDto })
	@ApiResponse({ status: 404, description: "VocabCatalog not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetVocabCatalogResponseDto> {
		const entity = await this.vocabCatalogService.findOne(id);
		const counts = await this.vocabCatalogService.getWordsCountByCatalogIds(
			entity ? [entity.id] : [],
		);
		return {
			items: entity
				? [
						{
							...entity,
							wordsCount: counts.get(entity.id) ?? 0,
						},
					]
				: [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create vocab catalog" })
	@ApiBody({ type: PostVocabCatalogRequestDto })
	@ApiResponse({ status: 201, type: PostVocabCatalogResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostVocabCatalogRequestDto,
	): Promise<PostVocabCatalogResponseDto> {
		return await this.vocabCatalogService.create(dto);
	}

	@Put()
	@ApiOperation({ summary: "Update vocab catalog" })
	@ApiBody({ type: PutVocabCatalogRequestDto })
	@ApiResponse({ status: 200, type: PutVocabCatalogResponseDto })
	@ApiResponse({ status: 404, description: "VocabCatalog not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(
		@Body() dto: PutVocabCatalogRequestDto,
	): Promise<PutVocabCatalogResponseDto> {
		return await this.vocabCatalogService.update(dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete vocab catalog" })
	@ApiResponse({ status: 200, type: DeleteVocabCatalogResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: number,
	): Promise<DeleteVocabCatalogResponseDto> {
		await this.vocabCatalogService.remove(id);
		return { id };
	}
}
