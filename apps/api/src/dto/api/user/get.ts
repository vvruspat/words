import { ApiProperty } from "@nestjs/swagger";
import type { GetUserRequest, GetUserResponse, User } from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { UserDto } from "../../entities/user.dto";

export class GetUserRequestDto implements GetUserRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: User["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: User["created_at"];
	@ApiProperty({ type: String, required: false })
	email?: User["email"];
	@ApiProperty({ type: String, required: false })
	name?: User["name"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetUserResponseDto implements GetUserResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [UserDto], required: false })
	data?: User[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
