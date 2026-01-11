import { ConfigService } from "@nestjs/config";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const BullQueueProvider = {
	provide: "BULLMQ_QUEUE",
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => {
		if (configService.get<string>("REDIS_URL")) {
			const connection = new IORedis(configService.get<string>("REDIS_URL"));

			return new Queue("word-translation", { connection });
		} else {
			return new Queue("word-translation", {
				connection: {
					host: configService.get<string>("REDIS_HOST"),
					port: configService.get<number>("REDIS_PORT"),
					password: configService.get<string>("REDIS_PASSWORD"),
					username: configService.get<string>("REDIS_USER"),
					db: configService.get<number>("REDIS_DB"),
				},
			});
		}
	},
};
