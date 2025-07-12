import type { ApiResponse } from "../../common/api-response";
import type { User } from "../../database";

export interface PostUserRequest extends Omit<User, "id"> {}

export interface PostUserResponse extends ApiResponse<User> {}
