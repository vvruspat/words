import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
	BadRequestException,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Req,
	Res,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import * as z from "zod/v4";
import { CurrentUser } from "~/auth/current-user.decorator";
import type { UserEntity } from "~/user/user.entity";
import { McpToolsService } from "./mcp-tools.service";

@ApiTags("mcp")
@Controller("mcp")
export class McpController {
	constructor(private readonly mcpToolsService: McpToolsService) {}

	@Post()
	@ApiOperation({ summary: "Words MCP Streamable HTTP endpoint" })
	@ApiResponse({ status: 200, description: "MCP JSON-RPC response" })
	async handlePost(
		@Req() req: Request,
		@Res() res: Response,
		@CurrentUser() user: UserEntity,
	): Promise<void> {
		let server: ReturnType<McpToolsService["createServer"]> | null = null;
		let transport: StreamableHTTPServerTransport | null = null;

		try {
			const context = z
				.object({
					dialogueSessionId: z.uuid().optional(),
					dialogueMessageId: z.uuid().optional(),
				})
				.safeParse({
					dialogueSessionId: req.get("X-Dialogue-Session-Id"),
					dialogueMessageId: req.get("X-Dialogue-Message-Id"),
				});
			if (!context.success)
				throw new BadRequestException("Invalid dialogue context");
			const { dialogueSessionId, dialogueMessageId } = context.data;
			if (dialogueMessageId && !dialogueSessionId)
				throw new BadRequestException(
					"A message context requires its dialogue session",
				);
			server = this.mcpToolsService.createServer({
				user,
				dialogueSessionId,
				dialogueMessageId,
			});
			transport = new StreamableHTTPServerTransport({
				sessionIdGenerator: undefined,
				enableJsonResponse: true,
			});
			await server.connect(transport);
			await transport.handleRequest(req, res, req.body);
		} catch (error) {
			if (!res.headersSent) {
				const status =
					error instanceof HttpException
						? error.getStatus()
						: HttpStatus.INTERNAL_SERVER_ERROR;
				res.status(status).json({
					jsonrpc: "2.0",
					error: {
						code: -32603,
						message:
							error instanceof Error ? error.message : "Internal server error",
					},
					id: null,
				});
			}
		} finally {
			await transport?.close();
			await server?.close();
		}
	}

	@Get()
	@Delete()
	async methodNotAllowed(@Res() res: Response): Promise<void> {
		res
			.status(HttpStatus.METHOD_NOT_ALLOWED)
			.setHeader("Allow", "POST")
			.json({
				jsonrpc: "2.0",
				error: {
					code: -32000,
					message: "Method not allowed. Use POST for MCP requests.",
				},
				id: null,
			});
	}
}
