import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { UserDto } from "~/dto/entities";
import { PostSignInResponseDto } from "../signin";

export class PostSignUpRequestDto extends PickType(UserDto, [
	"email",
	"name",
] as const) {
	@ApiProperty({
		description: "Language the user speaks",
		example: "en",
	})
	@IsString()
	language_speak: string;

	@ApiProperty({
		description: "Language the user is learning",
		example: "es",
	})
	@IsString()
	language_learn: string;
}

export class PostSignUpResponseDto extends PostSignInResponseDto {}
