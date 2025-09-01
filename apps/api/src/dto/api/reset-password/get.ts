import { PickType } from "@nestjs/swagger";
import { UserDto } from "~/dto/entities";

export class GetResetPasswordRequestDto extends PickType(UserDto, [
	"email",
] as const) {}
