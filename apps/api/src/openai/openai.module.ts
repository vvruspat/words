import { Module } from "@nestjs/common";
import { OpenAIController } from "./openai.controller";
import { OpenAIQueueProcessor } from "./openai.queue.processor";
import { OpenAIService } from "./openai.service";

@Module({
	controllers: [OpenAIController],
	providers: [OpenAIService, OpenAIQueueProcessor],
})
export class OpenAIModule {}
