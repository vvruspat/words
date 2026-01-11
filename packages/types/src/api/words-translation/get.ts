import { paths } from "../../api";

export type GetWordsTranslationResponse =
	paths["/words-translation"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetWordsTranslationRequest =
	paths["/words-translation"]["get"]["parameters"]["query"];
