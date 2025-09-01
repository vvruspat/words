import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetVerifyEmailRequestDto {
	@ApiProperty({
		type: String,
		description: "Email verification token",
	})
	@IsString()
	token!: string;
}
