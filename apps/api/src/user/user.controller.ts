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
	DeleteUserRequestDto,
	DeleteUserResponseDto,
} from "~/dto/api/user/delete";
import { GetUserRequestDto, GetUserResponseDto } from "~/dto/api/user/get";
import { PostUserRequestDto, PostUserResponseDto } from "~/dto/api/user/post";
import { PutUserRequestDto, PutUserResponseDto } from "~/dto/api/user/put";
import { UserService } from "./user.service";

@ApiTags("user")
@Controller("user")
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	@ApiOperation({ summary: "Get all users" })
	@ApiQuery({ type: GetUserRequestDto })
	@ApiResponse({ status: 200, type: GetUserResponseDto })
	@ApiResponse({ status: 400, description: "Invalid param" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getAll(@Query() query: GetUserRequestDto): Promise<GetUserResponseDto> {
		const entities = await this.userService.findAll(query);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entities,
			total: entities.length,
			limit: entities.length,
			offset: 0,
		};
	}

	@Get(":id")
	@ApiOperation({ summary: "Get user by id" })
	@ApiParam({ name: "id", type: Number, required: true })
	@ApiResponse({ status: 200, type: GetUserResponseDto })
	@ApiResponse({ status: 404, description: "User not found" })
	@ApiResponse({ status: 500, description: "Server error" })
	async getById(
		@Param("id", ParseIntPipe) id: number,
	): Promise<GetUserResponseDto> {
		const entity = await this.userService.findOne(id);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity ? [entity] : [],
			total: entity ? 1 : 0,
			limit: 1,
			offset: 0,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create user" })
	@ApiResponse({ status: 201, type: PostUserResponseDto })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async create(@Body() dto: PostUserRequestDto): Promise<PostUserResponseDto> {
		const entity = await this.userService.create(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Put()
	@ApiOperation({ summary: "Update user" })
	@ApiResponse({ status: 200, type: PutUserResponseDto })
	@ApiResponse({ status: 404, description: "User not found" })
	@ApiResponse({ status: 400, description: "Invalid data" })
	@ApiResponse({ status: 500, description: "Server error" })
	@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
	async update(@Body() dto: PutUserRequestDto): Promise<PutUserResponseDto> {
		const entity = await this.userService.update(dto);
		return {
			status: ApiResponseStatus.SUCCESS,
			data: entity,
		};
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete user" })
	@ApiResponse({ status: 200, type: DeleteUserResponseDto })
	async remove(
		@Param("id", ParseIntPipe) id: DeleteUserRequestDto["id"],
	): Promise<DeleteUserResponseDto> {
		await this.userService.remove(id);
		return {
			status: ApiResponseStatus.SUCCESS,
		};
	}
}
