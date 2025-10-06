import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PostVerifyEmailRequestDto {
	@ApiProperty({
		type: String,
		description: "Email verification code",
	})
	@IsString()
	code!: string;

	@ApiProperty({
		type: String,
		description: "User email",
	})
	@IsString()
	email!: string;
}
