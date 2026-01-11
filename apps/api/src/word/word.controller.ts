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
	Res,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Language } from "@repo/types";
import type { Response } from "express";
import {
	DeleteWordRequestDto,
	DeleteWordResponseDto,
	GetWordRequestDto,
	GetWordResponseDto,
	PutWordRequestDto,
	PutWordResponseDto,
} from "~/dto/api/word";
import { WordService } from "./word.service";
import { WordEventService } from "./word-event.service";

@ApiTags("word")
@Controller("word")
export class WordController {
	constructor(
		private readonly wordService: WordService,
		private readonly wordEventService: WordEventService,
	) {}

	@Get()
	@ApiOperation({ summary: "Get all words" })
	@ApiResponse({ status: 200, type: GetWordResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(@Query() query: GetWordRequestDto): Promise<GetWordResponseDto> {
		const entities = await this.wordService.findAll(query);

		return {
			items: entities.items,
			total: entities.total,
			limit: query.limit ?? 10,
			offset: query.offset ?? 0,
		};
	}

	// @Get(":id")
	// @ApiOperation({ summary: "Get word by id" })
	// @ApiParam({ name: "id", type: Number, required: true })
	// @ApiResponse({ status: 200, type: GetWordResponseDto })
	// @ApiResponse({ status: 404, description: "Word not found" })
	// @ApiResponse({ status: 500, description: "Server error" })
	// async getById(
	// 	@Param("id", ParseIntPipe) id: number,
	// ): Promise<GetWordResponseDto> {
	// 	const entity = await this.wordService.findOne(id);
	// 	return {
	// 		items: entity ? [entity] : [],
	// 		total: entity ? 1 : 0,
	// 		limit: 1,
	// 		offset: 0,
	// 	};
	// }

	// @Post()
	// @ApiOperation({ summary: "Create word" })
	// @ApiResponse({ status: 201, type: PostWordResponseDto })
	// @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	// async create(@Body() dto: PostWordRequestDto): Promise<PostWordResponseDto> {
	// 	// Add default status if not present in dto
	// 	const wordToCreate = { ...dto, status: "active" };
	// 	return await this.wordService.create(wordToCreate);
	// }

	@Put()
	@ApiOperation({ summary: "Update word" })
	@ApiResponse({ status: 200, type: PutWordResponseDto })
	@ApiResponse({ status: 404, description: "Word not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(@Body() dto: PutWordRequestDto): Promise<PutWordResponseDto> {
		return await this.wordService.update(dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete word" })
	@ApiResponse({ status: 200, type: DeleteWordResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteWordRequestDto["id"],
	): Promise<DeleteWordResponseDto> {
		await this.wordService.remove(id);
		return { id };
	}

	@Post("generate")
	@ApiOperation({ summary: "Generate words" })
	@ApiResponse({ status: 200, description: "Word generation started" })
	async generateWords(
		@Query("language") language: Language,
		@Query("topic") topic?: string,
		@Query("level") level?: string,
	): Promise<{ message: string }> {
		if (!language) {
			throw new Error("Language query parameter is required");
		}
		await this.wordService.generateWords(language, topic, level);
		return { message: "Word generation started" };
	}

	@Get("events")
	@ApiOperation({ summary: "Stream word update events via Server-Sent Events" })
	@ApiResponse({ status: 200, description: "SSE stream of word updates" })
	async streamEvents(@Res() res: Response): Promise<void> {
		// Set SSE headers
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no"); // Disable buffering in nginx

		// Send initial connection message
		res.write(": connected\n\n");

		// Subscribe to word update events
		const subscription = this.wordEventService.getEventStream().subscribe({
			next: (event) => {
				// Format as SSE message
				const data = JSON.stringify(event);
				res.write(`data: ${data}\n\n`);
			},
			error: (error) => {
				const errorData = JSON.stringify({
					type: "error",
					message: error.message,
				});
				res.write(`data: ${errorData}\n\n`);
			},
		});

		// Send periodic heartbeat to keep connection alive
		const heartbeatInterval = setInterval(() => {
			res.write(": heartbeat\n\n");
		}, 30000); // Every 30 seconds

		// Handle client disconnect
		res.on("close", () => {
			clearInterval(heartbeatInterval);
			subscription.unsubscribe();
			res.end();
		});
	}
}
