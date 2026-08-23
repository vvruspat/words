import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
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
			server = this.mcpToolsService.createServer({ user });
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
