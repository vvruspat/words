import { PickType } from "@nestjs/swagger";
import { UserDto } from "../../entities/user.dto";

export class DeleteUserRequestDto extends PickType(UserDto, ["id"] as const) {}
export class DeleteUserResponseDto extends PickType(UserDto, ["id"] as const) {}
