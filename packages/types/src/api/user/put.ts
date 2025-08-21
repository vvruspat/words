import { paths } from "../../api";

export type PutUserResponse = paths["/user"]["put"]["responses"]["200"]["content"]["application/json"];
export type PutUserRequest = paths["/user"]["put"]["requestBody"]["content"]["application/json"];
