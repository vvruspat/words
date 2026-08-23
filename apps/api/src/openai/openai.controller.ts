import { Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "~/auth/public.decorator";
import { OpenAIService } from "./openai.service";

@Public()
@Controller("openai")
export class OpenAIController {
	constructor(private readonly openaiService: OpenAIService) {}

	@Post("webhook")
	handleWebhook(@Req() req: Request, @Res() res: Response) {
		const headers = req.headers as Record<string, string>;
		return this.openaiService.handleWebhook(req, res, headers);
	}
}
