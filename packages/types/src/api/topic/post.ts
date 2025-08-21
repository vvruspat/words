import { paths } from "../../api";

export type PostTopicResponse = paths["/topic"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostTopicRequest = paths["/topic"]["post"]["requestBody"]["content"]["application/json"];
