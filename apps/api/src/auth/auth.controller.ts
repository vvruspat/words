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
	GetVerifyEmailRequestDto,
	PostRefreshTokenRequestDto,
	PostRefreshTokenResponseDto,
	PostSignInRequestDto,
	PostSignInResponseDto,
	PostSignUpRequestDto,
	PostSignUpResponseDto,
} from "~/dto";
import {
	GetResetPasswordRequestDto,
	PutResetPasswordRequestDto,
} from "~/dto/api/reset-password";
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
		return this.authService.signUp(dto.name, dto.email, dto.password);
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

	@Get("verify-email")
	@HttpCode(HttpStatus.OK)
	async sendVerificationEmail(
		@Query() dto: GetVerifyEmailRequestDto,
	): Promise<void> {
		return this.authService.verifyEmail(dto.token);
	}

	@Post("refresh-token")
	@HttpCode(HttpStatus.OK)
	async refreshToken(
		@Body() dto: PostRefreshTokenRequestDto,
	): Promise<PostRefreshTokenResponseDto> {
		return this.authService.refreshToken(dto.refresh_token);
	}
}
