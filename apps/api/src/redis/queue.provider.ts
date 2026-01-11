import { Queue } from "bullmq";
import { Redis } from "ioredis";

export const BullQueueProvider = {
	provide: "BULLMQ_QUEUE",
	inject: ["REDIS_CLIENT"],
	useFactory: (redis: Redis) => {
		return new Queue("word-translation", {
			connection: redis,
		});
	},
};
