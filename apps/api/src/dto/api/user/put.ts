import { ApiProperty } from "@nestjs/swagger";
import type { PutUserRequest, PutUserResponse, User } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { UserDto } from "../../entities/user.dto";

export class PutUserRequestDto implements PutUserRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: User["id"];
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: User["created_at"];
	@ApiProperty({ type: String })
	email!: User["email"];
	@ApiProperty({ type: String })
	name!: User["name"];
	@ApiProperty({ type: String, required: false })
	password?: string;
}

export class PutUserResponseDto implements PutUserResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: UserDto, required: false })
	data?: User;
	@ApiProperty({ required: false })
	error?: unknown;
}
