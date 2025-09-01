import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserDto } from "~/dto/entities";

export class PostSignInRequestDto extends PickType(UserDto, ["email"]) {
	@ApiProperty({
		type: String,
		description: "User password",
		example: "Strong#Password123",
		required: true,
	})
	@IsString()
	password!: string;
}

export class PostSignInResponseDto {
	@ApiProperty({ type: String, description: "JWT access token" })
	access_token: string;

	@ApiProperty({ type: String, description: "JWT refresh token" })
	refresh_token: string;

	@ApiProperty({
		type: UserDto,
		description: "User information without password",
	})
	user: UserDto;
}
