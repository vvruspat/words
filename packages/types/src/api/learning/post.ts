import { paths } from "../../api";

export type PostLearningResponse = paths["/learning"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostLearningRequest = paths["/learning"]["post"]["requestBody"]["content"]["application/json"];
