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

export class PostTmpPasswordResponseDto {
	@ApiProperty({ type: Boolean, description: "Whether the user is new" })
	is_new_user: boolean;
}
