import { paths } from "../../api";

export type PutWordResponse = paths["/word"]["put"]["responses"]["200"]["content"]["application/json"];
export type PutWordRequest = paths["/word"]["put"]["requestBody"]["content"]["application/json"];
