import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "~/auth/auth.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
	imports: [AuthModule, ConfigModule],
	controllers: [ChatController],
	providers: [ChatService],
})
export class ChatModule {}
