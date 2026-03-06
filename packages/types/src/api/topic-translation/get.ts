import { paths } from "../../api";

export type GetTopicTranslationResponse =
	paths["/topic-translation"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetTopicTranslationRequest =
	paths["/topic-translation"]["get"]["parameters"]["query"];
