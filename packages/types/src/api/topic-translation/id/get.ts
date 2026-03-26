import { paths } from "../../../api";

export type GetTopicTranslationByIdResponse = paths["/topic-translation/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetTopicTranslationByIdRequest = paths["/topic-translation/{id}"]["get"]["parameters"]["path"];
