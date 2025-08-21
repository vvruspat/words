import { paths } from "../../../api";

export type GetTopicByIdResponse = paths["/topic/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
