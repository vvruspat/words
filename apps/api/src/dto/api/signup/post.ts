import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsStrongPassword } from "class-validator";
import { UserDto } from "~/dto/entities";
import { PostSignInResponseDto } from "../signin";

export class PostSignUpRequestDto extends PickType(UserDto, [
	"email",
	"name",
] as const) {
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
	password!: string;
}

export class PostSignUpResponseDto extends PostSignInResponseDto {}
