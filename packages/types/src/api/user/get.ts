import type { PaginatedResponse } from "../../common/api-response";
import type { User } from "../../database";

export interface GetUserRequest extends Partial<User> {
	limit?: number;
	offset?: number;
}

export interface GetUserResponse extends PaginatedResponse<User> {}
