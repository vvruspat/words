import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";

export const BullQueueProvider = {
	provide: "BULLMQ_QUEUE",
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		return new Queue("word-translation", {
			connection: {
				url: config.getOrThrow("REDIS_URL"),
			},
		});
	},
};
