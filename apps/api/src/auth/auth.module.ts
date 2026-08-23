import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MailerModule } from "~/mailer/mailer.module";
import { UserModule } from "~/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";

@Module({
	imports: [ConfigModule.forRoot(), MailerModule, UserModule, JwtModule],
	providers: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
	controllers: [AuthController],
	exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
