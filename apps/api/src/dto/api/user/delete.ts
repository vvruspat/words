import { ApiProperty } from "@nestjs/swagger";
import type { DeleteUserRequest, DeleteUserResponse, User } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { UserDto } from "../../entities/user.dto";

export class DeleteUserRequestDto implements DeleteUserRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: User["id"];
}

export class DeleteUserResponseDto implements DeleteUserResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: UserDto, required: false })
	data?: User;
	@ApiProperty({ required: false })
	error?: unknown;
}
