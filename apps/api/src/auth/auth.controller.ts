import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put,
	Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
	PostRefreshTokenRequestDto,
	PostRefreshTokenResponseDto,
	PostSignInRequestDto,
	PostSignInResponseDto,
	PostSignUpRequestDto,
	PostSignUpResponseDto,
	PostVerifyEmailRequestDto,
} from "~/dto";
import {
	GetResetPasswordRequestDto,
	PutResetPasswordRequestDto,
} from "~/dto/api/reset-password";
import { PostVerifyEmailResendRequestDto } from "~/dto/api/verify-email/resend/post";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("signin")
	@HttpCode(HttpStatus.OK)
	async signin(
		@Body() dto: PostSignInRequestDto,
	): Promise<PostSignInResponseDto> {
		return this.authService.signIn(dto.email, dto.password);
	}

	@Post("signup")
	@HttpCode(HttpStatus.CREATED)
	async signup(
		@Body() dto: PostSignUpRequestDto,
	): Promise<PostSignUpResponseDto> {
		return this.authService.signUp(
			dto.name,
			dto.email,
			dto.language_speak,
			dto.language_learn,
		);
	}

	@Put("reset-password")
	@HttpCode(HttpStatus.OK)
	async resetPassword(@Body() dto: PutResetPasswordRequestDto): Promise<void> {
		return this.authService.resetPassword(dto.token, dto.new_password);
	}

	@Get("reset-password")
	@HttpCode(HttpStatus.OK)
	async sendResetPasswordEmail(
		@Query() dto: GetResetPasswordRequestDto,
	): Promise<void> {
		return this.authService.sendResetPasswordEmail(dto.email);
	}

	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	async sendVerificationEmail(
		@Body() dto: PostVerifyEmailRequestDto,
	): Promise<void> {
		return this.authService.verifyEmail(dto.email, dto.code);
	}

	@Post("verify-email/resend")
	@HttpCode(HttpStatus.OK)
	async resendVerificationEmail(
		@Body() dto: PostVerifyEmailResendRequestDto,
	): Promise<void> {
		return this.authService.sendVerificationEmail(dto.email);
	}

	@Post("refresh-token")
	@HttpCode(HttpStatus.OK)
	async refreshToken(
		@Body() dto: PostRefreshTokenRequestDto,
	): Promise<PostRefreshTokenResponseDto> {
		return this.authService.refreshToken(dto.refresh_token);
	}
}
