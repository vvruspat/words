import type { ApiResponse } from "../../common/api-response";
import type { User } from "../../database";

export interface DeleteUserRequest {
	id: User["id"];
}

export interface DeleteUserResponse extends ApiResponse<User> {}
