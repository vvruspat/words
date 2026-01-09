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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DeleteVocabCatalogResponseDto } from "~/dto/api/vocabcatalog/delete";
import {
	type GetVocabCatalogRequestDto,
	GetVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/get";
import {
	type PostVocabCatalogRequestDto,
	PostVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/post";
import {
	type PutVocabCatalogRequestDto,
	PutVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/put";
import type { VocabCatalogService } from "./vocabcatalog.service";

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

		return {
			items: entities,
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
		return {
			items: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create vocab catalog" })
	@ApiResponse({ status: 201, type: PostVocabCatalogResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(
		@Body() dto: PostVocabCatalogRequestDto,
	): Promise<PostVocabCatalogResponseDto> {
		return await this.vocabCatalogService.create(dto);
	}

	@Put()
	@ApiOperation({ summary: "Update vocab catalog" })
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
