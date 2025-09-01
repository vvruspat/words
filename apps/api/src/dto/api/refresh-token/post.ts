import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { PostSignInResponseDto } from "../signin";

export class PostRefreshTokenRequestDto {
	@ApiProperty({
		type: String,
		description: "Refresh token",
	})
	@IsString()
	refresh_token!: string;
}

export class PostRefreshTokenResponseDto extends PostSignInResponseDto {}
