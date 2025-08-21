import { OmitType } from "@nestjs/swagger";
import { UserDto } from "../../entities/user.dto";

export class PostUserRequestDto extends OmitType(UserDto, ["id"] as const) {}
export class PostUserResponseDto extends UserDto {}
