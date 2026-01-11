import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: "REDIS_CLIENT",
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const url = config.get<string>("REDIS_URL");

				const redis = url
					? new Redis(url, {
							lazyConnect: true,
							maxRetriesPerRequest: null,
						})
					: new Redis({
							host: config.get("REDIS_HOST"),
							port: config.get("REDIS_PORT"),
							username: config.get("REDIS_USER"),
							password: config.get("REDIS_PASSWORD"),
							db: config.get("REDIS_DB"),
							lazyConnect: true,
							maxRetriesPerRequest: null,
						});

				redis.on("error", (err) => {
					console.error("[Redis] connection error:", err.message);
				});

				return redis;
			},
		},
	],
	exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
