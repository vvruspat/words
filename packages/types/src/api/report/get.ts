import { paths } from "../../api";

export type GetReportResponse = paths["/report"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetReportRequest = paths["/report"]["get"]["parameters"]["query"];
