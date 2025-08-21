import { paths } from "../../api";

export type PostWordResponse = paths["/word"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostWordRequest = paths["/word"]["post"]["requestBody"]["content"]["application/json"];
