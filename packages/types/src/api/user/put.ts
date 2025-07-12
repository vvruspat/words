import type { ApiResponse } from "../../common/api-response";
import type { User } from "../../database";

export interface PutUserRequest extends User {}

export interface PutUserResponse extends ApiResponse<User> {}
