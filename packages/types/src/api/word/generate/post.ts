import { paths } from "../../../api";

export type PostWordByGenerateResponse =
	paths["/word/generate"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostWordByGenerateRequest =
	paths["/word/generate"]["post"]["parameters"]["query"];
