import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsStrongPassword } from "class-validator";

export class PutResetPasswordRequestDto {
	@ApiProperty({
		type: String,
		description: "User password",
		example: "Strong#Password123",
		required: true,
	})
	@IsStrongPassword({
		minLength: 8,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	new_password!: string;

	@ApiProperty({
		type: String,
		description: "Password reset token",
	})
	@IsString()
	token!: string;
}
