import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

@Global()
@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true })],
	providers: [
		{
			provide: "REDIS_CLIENT",
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return new Redis({
					host: configService.get<string>("REDIS_HOST"),
					port: configService.get<number>("REDIS_PORT"),
					password: configService.get<string>("REDIS_PASSWORD"),
				});
			},
		},
	],
	exports: ["REDIS_CLIENT"],
})
export class RedisModule {}
