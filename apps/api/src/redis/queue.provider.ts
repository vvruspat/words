import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";

export const BullQueueProvider = {
	provide: "BULLMQ_QUEUE",
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		return new Queue("word-translation", {
			connection: {
				host: configService.get<string>("REDIS_HOST"),
				port: configService.get<number>("REDIS_PORT"),
				password: configService.get<string>("REDIS_PASSWORD"),
			},
		});
	},
};
