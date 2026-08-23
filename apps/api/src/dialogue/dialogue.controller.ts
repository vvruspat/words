import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";
import { BearerAuthorization } from "~/auth/bearer-authorization.decorator";
import { CurrentUser } from "~/auth/current-user.decorator";
import type { UserEntity } from "~/user/user.entity";
import { DialogueService } from "./dialogue.service";
import { DialogueApplicationService } from "./dialogue-application.service";
import { DialogueFeatureGuard } from "./dialogue-feature.guard";

class StartDialogueDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsOptional()
	@IsString()
	@MaxLength(120)
	title?: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(500)
	customTopic?: string;
}

class SendDialogueMessageDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(2000)
	content: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(8)
	@MaxLength(100)
	clientMessageId: string;
}

class AddClickedWordDto {
	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(100)
	word: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsString()
	@MinLength(1)
	@MaxLength(2000)
	context: string;

	@Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
	@IsOptional()
	@IsString()
	messageId?: string;
}

class InteractionDto {
	@IsIn(["hint", "translation"])
	type: "hint" | "translation";
}

@ApiTags("dialogues")
@ApiBearerAuth()
@Controller("dialogues")
@UseGuards(DialogueFeatureGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class DialogueController {
	constructor(
		private readonly application: DialogueApplicationService,
		private readonly dialogue: DialogueService,
	) {}

	@Get("recommendations")
	@ApiOperation({ summary: "Generate dialogue scenarios for the learner" })
	recommendations(
		@CurrentUser() user: UserEntity,
		@BearerAuthorization() authorization: string,
	) {
		return this.application.recommendations(user, authorization);
	}

	@Get("active")
	@ApiOperation({ summary: "Get the active dialogue for the language pair" })
	active(@CurrentUser() user: UserEntity) {
		return this.dialogue.getActive(user);
	}

	@Get()
	@ApiOperation({ summary: "List the learner's dialogue history" })
	list(@CurrentUser() user: UserEntity) {
		return this.dialogue.list(user.id);
	}

	@Post()
	@ApiOperation({ summary: "Start a dialogue and generate its opening line" })
	start(
		@CurrentUser() user: UserEntity,
		@BearerAuthorization() authorization: string,
		@Body() body: StartDialogueDto,
	) {
		const title = body.title?.trim() || body.customTopic?.trim();
		if (!title) {
			throw new BadRequestException("title or customTopic is required");
		}
		return this.application.start({
			user,
			authorization,
			title,
			description: body.description,
			customTopic: body.customTopic,
		});
	}

	@Post("corrections/:id/branch")
	@ApiOperation({ summary: "Open or resume an explanation branch" })
	openBranch(@CurrentUser() user: UserEntity, @Param("id") id: string) {
		return this.application.openCorrectionBranch({ user, correctionId: id });
	}

	@Post("threads/:id/messages")
	@ApiOperation({ summary: "Continue an explanation branch" })
	sendBranchMessage(
		@CurrentUser() user: UserEntity,
		@Param("id") threadId: string,
		@Body() body: SendDialogueMessageDto,
	) {
		return this.application.sendExplanationMessage({
			user,
			threadId,
			content: body.content.trim(),
			clientMessageId: body.clientMessageId,
		});
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a dialogue with threads and messages" })
	detail(@CurrentUser() user: UserEntity, @Param("id") id: string) {
		return this.dialogue.getDetail(id, user.id);
	}

	@Post(":id/messages")
	@ApiOperation({ summary: "Send the next main dialogue turn" })
	sendMessage(
		@CurrentUser() user: UserEntity,
		@BearerAuthorization() authorization: string,
		@Param("id") sessionId: string,
		@Body() body: SendDialogueMessageDto,
	) {
		return this.application.sendMainMessage({
			user,
			authorization,
			sessionId,
			content: body.content.trim(),
			clientMessageId: body.clientMessageId,
		});
	}

	@Post(":id/words")
	@ApiOperation({ summary: "Resolve and add a clicked word" })
	addWord(
		@CurrentUser() user: UserEntity,
		@Param("id") sessionId: string,
		@Body() body: AddClickedWordDto,
	) {
		return this.application.addClickedWord({
			user,
			sessionId,
			messageId: body.messageId,
			word: body.word,
			context: body.context,
		});
	}

	@Post(":id/complete")
	@ApiOperation({ summary: "Complete a dialogue and generate its summary" })
	complete(@CurrentUser() user: UserEntity, @Param("id") sessionId: string) {
		return this.application.finish(user, sessionId);
	}

	@Post(":id/interactions")
	@ApiOperation({ summary: "Record a hint or translation reveal" })
	async interaction(
		@CurrentUser() user: UserEntity,
		@Param("id") sessionId: string,
		@Body() body: InteractionDto,
	) {
		await this.dialogue.getOwnedSession(sessionId, user.id);
		return this.dialogue.incrementMetric(
			sessionId,
			body.type === "hint" ? "hints" : "translations",
		);
	}

	@Delete()
	@ApiOperation({ summary: "Delete all dialogue history" })
	async deleteAll(@CurrentUser() user: UserEntity) {
		await this.dialogue.deleteAll(user.id);
		return { deleted: true };
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete one dialogue" })
	async delete(@CurrentUser() user: UserEntity, @Param("id") id: string) {
		await this.dialogue.deleteSession(id, user.id);
		return { id };
	}
}
