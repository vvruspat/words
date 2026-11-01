import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MailerModule } from "~/mailer/mailer.module";
import { UserModule } from "~/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { OptionalJwtAuthGuard } from "./optional-jwt-auth.guard";
import { DatabaseModule } from "../database/database.module";
import { SocialAuthController } from "./social-auth.controller";
import { SocialAuthService } from "./social-auth.service";
import { SocialTokenVerifier } from "./social-token-verifier";

@Module({
	imports: [
		ConfigModule.forRoot(),
		MailerModule,
		UserModule,
		JwtModule,
		DatabaseModule,
	],
	providers: [
		AuthService,
		JwtAuthGuard,
		OptionalJwtAuthGuard,
		SocialAuthService,
		SocialTokenVerifier,
	],
	controllers: [AuthController, SocialAuthController],
	exports: [AuthService, JwtAuthGuard, OptionalJwtAuthGuard],
})
export class AuthModule {}
