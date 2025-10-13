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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
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
	@ApiOperation({ summary: "Sign in to an existing account" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User successfully signed in",
		type: PostSignInResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid credentials",
	})
	async signin(
		@Body() dto: PostSignInRequestDto,
	): Promise<PostSignInResponseDto> {
		return this.authService.signIn(dto.email, dto.password);
	}

	@Post("signup")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Create a new user account" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "User successfully created",
		type: PostSignUpResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid input data or user already exists",
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: "User already exists",
	})
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
	@ApiOperation({ summary: "Reset user password with token" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Password successfully reset",
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid input data",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid or expired token",
	})
	async resetPassword(@Body() dto: PutResetPasswordRequestDto): Promise<void> {
		return this.authService.resetPassword(dto.token, dto.new_password);
	}

	@Get("reset-password")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Send password reset email" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Password reset email sent successfully",
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid email",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "User not found",
	})
	async sendResetPasswordEmail(
		@Query() dto: GetResetPasswordRequestDto,
	): Promise<void> {
		return this.authService.sendResetPasswordEmail(dto.email);
	}

	@Post("verify-email")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Verify email with verification code" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Email successfully verified",
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid or expired verification code",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "User not found",
	})
	async sendVerificationEmail(
		@Body() dto: PostVerifyEmailRequestDto,
	): Promise<void> {
		return this.authService.verifyEmail(dto.email, dto.code);
	}

	@Post("verify-email/resend")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Resend email verification code" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Verification email sent successfully",
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid email",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "User not found",
	})
	async resendVerificationEmail(
		@Body() dto: PostVerifyEmailResendRequestDto,
	): Promise<void> {
		return this.authService.sendVerificationEmail(dto.email);
	}

	@Post("refresh-token")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Refresh access token" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Token successfully refreshed",
		type: PostRefreshTokenResponseDto,
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid or expired refresh token",
	})
	async refreshToken(
		@Body() dto: PostRefreshTokenRequestDto,
	): Promise<PostRefreshTokenResponseDto> {
		return this.authService.refreshToken(dto.refresh_token);
	}
}
