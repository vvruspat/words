import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
	ArrayMaxSize,
	IsArray,
	IsBoolean,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from "class-validator";
import { CurrentUser } from "~/auth/current-user.decorator";
import type { UserEntity } from "~/user/user.entity";
import {
	UserVocabularyService,
	type VocabularyWordSource,
} from "./user-vocabulary.service";

class AddVocabularyWordDto {
	@IsString()
	@MaxLength(100)
	word: string;

	@IsString()
	@MaxLength(300)
	translation: string;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	transcription?: string;

	@IsOptional()
	@IsIn(["click", "native_insert", "correction", "manual"])
	source?: VocabularyWordSource;

	@IsOptional()
	@IsBoolean()
	resetWriting?: boolean;
}

class AddVocabularyWordsDto {
	@IsArray()
	@ArrayMaxSize(10)
	@ValidateNested({ each: true })
	@Type(() => AddVocabularyWordDto)
	words: AddVocabularyWordDto[];

	@IsOptional()
	@IsString()
	sessionId?: string;
}

@ApiTags("user-vocabulary")
@ApiBearerAuth()
@Controller("user-vocabulary")
export class UserVocabularyController {
	constructor(private readonly service: UserVocabularyService) {}

	@Get()
	@ApiOperation({ summary: "List the authenticated user's vocabulary" })
	list(@CurrentUser() user: UserEntity, @Query("language") language?: string) {
		return this.service.list(user, language);
	}

	@Post()
	@ApiOperation({ summary: "Add resolved words to the user's vocabulary" })
	add(@CurrentUser() user: UserEntity, @Body() body: AddVocabularyWordsDto) {
		return this.service.addWords({
			user,
			words: body.words,
			sessionId: body.sessionId,
		});
	}

	@Delete(":id")
	@ApiOperation({ summary: "Remove an item from the user's vocabulary" })
	async remove(
		@CurrentUser() user: UserEntity,
		@Param("id") id: string,
	): Promise<{ id: string }> {
		await this.service.remove(user.id, id);
		return { id };
	}
}
