import { paths } from "../../api";

export type PutTrainingResponse = paths["/training"]["put"]["responses"]["200"]["content"]["application/json"];
export type PutTrainingRequest = paths["/training"]["put"]["requestBody"]["content"]["application/json"];
