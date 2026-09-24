import { paths } from "../../../api";

export type GetWordBySynonymGroupsResponse = paths["/word/synonym-groups"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetWordBySynonymGroupsRequest = paths["/word/synonym-groups"]["get"]["parameters"]["query"];
