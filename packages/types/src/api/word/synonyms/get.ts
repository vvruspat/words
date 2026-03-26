import { paths } from "../../../api";

export type GetWordBySynonymsResponse = paths["/word/synonyms"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetWordBySynonymsRequest = paths["/word/synonyms"]["get"]["parameters"]["query"];
