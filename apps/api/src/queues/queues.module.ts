import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import {
	OPENAI_QUEUE,
	TRANSLATIONS_QUEUE,
	WORDS_QUEUE,
} from "~/constants/queues.constants";

@Global()
@Module({
	imports: [
		BullModule.registerQueue(
			{ name: WORDS_QUEUE },
			{ name: TRANSLATIONS_QUEUE },
			{ name: OPENAI_QUEUE },
		),
	],
	exports: [BullModule],
})
export class QueuesModule {}
