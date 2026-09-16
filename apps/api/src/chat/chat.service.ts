import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	convertToModelMessages,
	pruneMessages,
	stepCountIs,
	streamText,
	type UIMessage,
} from "ai";
import type { Response } from "express";
import { MCP_TOOL_SCHEMAS } from "~/mcp/mcp-tool.schemas";
import { CHAT_ASSISTANT_SYSTEM_PROMPT } from "~/prompts";
import type { UserEntity } from "~/user/user.entity";

export type AssistantChatRequest = {
	messages?: UIMessage[];
	system?: string;
};

@Injectable()
export class ChatService {
	private readonly logger = new Logger(ChatService.name);

	constructor(private readonly configService: ConfigService) {}

	async streamAssistantResponse({
		body,
		authorization,
		res,
		user,
	}: {
		body: AssistantChatRequest;
		authorization: string;
		res: Response;
		user: UserEntity;
	}): Promise<void> {
		if (!Array.isArray(body.messages)) {
			throw new BadRequestException("messages must be an array");
		}

		let mcpClient: MCPClient | null = null;
		let mcpClosed = false;

		const closeMcpClient = async () => {
			if (mcpClosed) {
				return;
			}
			mcpClosed = true;
			await mcpClient?.close();
		};

		try {
			mcpClient = await createMCPClient({
				transport: {
					type: "http",
					url: this.getMcpUrl(),
					headers: {
						Authorization: authorization,
					},
					redirect: "error",
				},
				name: "words-chat-api",
				version: "0.1.0",
				onUncaughtError: (error) => {
					this.logger.error("MCP client uncaught error", error);
				},
			});

			const tools = await mcpClient.tools({
				schemas: MCP_TOOL_SCHEMAS,
			});
			const messages = pruneMessages({
				messages: await convertToModelMessages(body.messages),
				reasoning: "none",
			});

			const result = streamText({
				model: openai(this.getModel()),
				providerOptions: {
					openai: { reasoningEffort: "medium", parallelToolCalls: false },
				},
				system: CHAT_ASSISTANT_SYSTEM_PROMPT(user, body.system),
				messages,
				tools,
				stopWhen: stepCountIs(this.getMaxSteps()),
				maxOutputTokens: this.getMaxOutputTokens(),
				onFinish: async () => {
					await closeMcpClient();
				},
				onAbort: async () => {
					await closeMcpClient();
				},
				onError: (error) => {
					this.logger.error("Chat stream error", error);
					void closeMcpClient();
				},
			});

			res.on("close", () => {
				void closeMcpClient();
			});

			result.pipeUIMessageStreamToResponse(res, {
				messageMetadata: ({ part }) => {
					if (part.type === "finish") {
						return {
							usage: part.totalUsage,
						};
					}

					if (part.type === "finish-step") {
						return {
							modelId: part.response.modelId,
						};
					}

					return undefined;
				},
			});
		} catch (error) {
			await closeMcpClient();
			throw error;
		}
	}

	private getMcpUrl(): string {
		const configuredUrl = this.configService.get<string>("CHAT_MCP_URL");

		if (configuredUrl) {
			return configuredUrl;
		}

		const port = this.configService.get<string>("PORT") || "3000";

		return `http://127.0.0.1:${port}/mcp`;
	}

	private getModel(): string {
		return this.configService.get<string>("OPENAI_CHAT_MODEL") || "gpt-5-nano";
	}

	private getMaxSteps(): number {
		return (
			Number(this.configService.get<string>("OPENAI_CHAT_MAX_STEPS")) || 10
		);
	}

	private getMaxOutputTokens(): number {
		return (
			Number(this.configService.get<string>("OPENAI_CHAT_MAX_OUTPUT_TOKENS")) ||
			15000
		);
	}
}
