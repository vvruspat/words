import { paths } from "../../../api";

export type GetWordByDuplicatesResponse =
	paths["/word/duplicates"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetWordByDuplicatesRequest =
	paths["/word/duplicates"]["get"]["parameters"]["query"];
