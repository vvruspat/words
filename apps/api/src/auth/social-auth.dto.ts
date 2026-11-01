import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUUID,
	MaxLength,
} from "class-validator";

export type SocialProvider = "apple" | "google";

export class SocialChallengeRequestDto {
	@ApiProperty({ enum: ["apple", "google"] })
	@IsIn(["apple", "google"])
	provider: SocialProvider;
}

export class SocialChallengeResponseDto {
	@ApiProperty({ type: String, format: "uuid" })
	challenge_id: string;

	@ApiProperty({
		type: String,
		description: "One-time nonce, valid for five minutes",
	})
	nonce: string;
}

export class SocialSignInRequestDto extends SocialChallengeRequestDto {
	@ApiProperty({ type: String, format: "uuid" })
	@IsUUID()
	challenge_id: string;

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@MaxLength(16384)
	id_token: string;

	@ApiPropertyOptional({
		type: String,
		description:
			"Apple first-authorization display name; never used as identity",
	})
	@IsOptional()
	@IsString()
	@MaxLength(200)
	name?: string;
}
