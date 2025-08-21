import { paths } from "../../api";

export type PostUserResponse = paths["/user"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostUserRequest = paths["/user"]["post"]["requestBody"]["content"]["application/json"];
