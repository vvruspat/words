import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
	PostSignInRequestDto,
	PostSignInResponseDto,
	PostSignUpRequestDto,
	PostSignUpResponseDto,
} from "~/dto";
import { AuthService } from "./auth.service";

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
		return this.authService.signUp(dto.email, dto.password);
	}
}
