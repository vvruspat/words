import { paths } from "../../../api";

export type GetAuthByVerifyEmailResponse = paths["/auth/verify-email"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetAuthByVerifyEmailRequest = paths["/auth/verify-email"]["get"]["parameters"]["query"];
