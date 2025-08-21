import { paths } from "../../api";

export type PutLearningResponse = paths["/learning"]["put"]["responses"]["200"]["content"]["application/json"];
export type PutLearningRequest = paths["/learning"]["put"]["requestBody"]["content"]["application/json"];
