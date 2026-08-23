import { paths } from "../../api";

export type GetUserVocabularyResponse =
	paths["/user-vocabulary"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetUserVocabularyRequest =
	paths["/user-vocabulary"]["get"]["parameters"]["query"];
