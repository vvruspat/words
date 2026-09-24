import { paths } from "../../../api";

export type PostWordByGenerateResponse = paths["/word/generate"]["post"]["responses"]["200"]["content"]["application/json"];
export type PostWordByGenerateRequest = paths["/word/generate"]["post"]["parameters"]["query"];
