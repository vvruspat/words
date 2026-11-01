import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PostSignInResponseDto } from "../dto/api/signin/post";
import { Public } from "./public.decorator";
import {
	SocialChallengeRequestDto,
	SocialChallengeResponseDto,
	SocialSignInRequestDto,
} from "./social-auth.dto";
import { SocialAuthService } from "./social-auth.service";

@ApiTags("auth")
@Public()
@Controller("auth/social")
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SocialAuthController {
	constructor(private readonly social: SocialAuthService) {}

	@Post("challenge")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Create a one-time Apple or Google sign-in nonce" })
	@ApiResponse({ status: 200, type: SocialChallengeResponseDto })
	challenge(@Body() dto: SocialChallengeRequestDto) {
		return this.social.challenge(dto.provider);
	}

	@Post("signin")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({
		summary:
			"Verify a native provider ID token and sign in or create an account",
	})
	@ApiResponse({ status: 200, type: PostSignInResponseDto })
	@ApiResponse({
		status: 401,
		description: "Invalid token or expired/used challenge",
	})
	@ApiResponse({
		status: 409,
		description: "Use email sign-in for the existing account",
	})
	signIn(@Body() dto: SocialSignInRequestDto) {
		return this.social.signIn(dto);
	}
}
