import { paths } from "../../api";

export type PutTopicResponse = paths["/topic"]["put"]["responses"]["200"]["content"]["application/json"];
export type PutTopicRequest = paths["/topic"]["put"]["requestBody"]["content"]["application/json"];
