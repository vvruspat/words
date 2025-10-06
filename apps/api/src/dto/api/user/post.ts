import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { UserDto } from "../../entities/user.dto";

export class PostUserRequestDto extends OmitType(UserDto, ["id"] as const) {
	@ApiProperty({ type: "string" })
	@IsString()
	@IsOptional()
	language_learn: string;
}
export class PostUserResponseDto extends UserDto {}
