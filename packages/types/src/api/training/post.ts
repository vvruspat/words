import { paths } from "../../api";

export type PostTrainingResponse = paths["/training"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostTrainingRequest = paths["/training"]["post"]["requestBody"]["content"]["application/json"];
