import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PostVerifyEmailResendRequestDto {
	@ApiProperty({
		type: String,
		description: "User email",
	})
	@IsString()
	email!: string;
}
