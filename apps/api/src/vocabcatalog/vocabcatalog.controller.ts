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
	DeleteVocabCatalogRequestDto,
	DeleteVocabCatalogResponseDto,
} from "~/dto/api/vocabcatalog/delete";
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

@ApiTags("vocab-catalog")
@Controller("vocab-catalog")
export class VocabCatalogController {
	constructor(private readonly vocabCatalogService: VocabCatalogService) {}

	@Get()
	@ApiOperation({ summary: "Get all vocab catalogs" })
	@ApiQuery({ type: GetVocabCatalogRequestDto })
	@ApiResponse({ status: 200, type: GetVocabCatalogResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(
		@Query() query: GetVocabCatalogRequestDto,
	): Promise<GetVocabCatalogResponseDto> {
		const entities = await this.vocabCatalogService.findAll(query);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
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
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
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
		const entity = await this.vocabCatalogService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
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
		const entity = await this.vocabCatalogService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete vocab catalog" })
	@ApiResponse({ status: 200, type: DeleteVocabCatalogResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteVocabCatalogRequestDto["id"],
	): Promise<DeleteVocabCatalogResponseDto> {
		await this.vocabCatalogService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
