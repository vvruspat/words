import { Module } from "@nestjs/common";
import { DatabaseModule } from "~/database/database.module";
import { TopicController } from "./topic.controller";
import { topicProviders } from "./topic.providers";
import { TopicService } from "./topic.service";

@Module({
	imports: [DatabaseModule],
	providers: [...topicProviders, TopicService],
	controllers: [TopicController],
})
export class TopicModule {}
