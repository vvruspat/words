import { Body, Controller, Post, Res } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { BearerAuthorization } from "~/auth/bearer-authorization.decorator";
import { CurrentUser } from "~/auth/current-user.decorator";
import type { UserEntity } from "~/user/user.entity";
import { type AssistantChatRequest, ChatService } from "./chat.service";

@ApiTags("chat")
@ApiBearerAuth()
@Controller("chat")
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Post()
	@ApiOperation({ summary: "Assistant UI chat endpoint" })
	async chat(
		@Body() body: AssistantChatRequest,
		@CurrentUser() user: UserEntity,
		@BearerAuthorization() authorization: string,
		@Res() res: Response,
	): Promise<void> {
		await this.chatService.streamAssistantResponse({
			body,
			authorization,
			res,
			user,
		});
	}
}
