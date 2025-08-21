import { PartialType } from "@nestjs/swagger";
import { UserDto } from "../../entities/user.dto";

export class PutUserRequestDto extends PartialType(UserDto) {
	id!: number;
}
export class PutUserResponseDto extends UserDto {}
