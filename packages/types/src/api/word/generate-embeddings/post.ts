import { paths } from "../../../api";

export type PostWordByGenerateEmbeddingsResponse = paths["/word/generate-embeddings"]["post"]["responses"]["200"]["content"]["application/json"];
export type PostWordByGenerateEmbeddingsRequest = paths["/word/generate-embeddings"]["post"]["parameters"]["query"];
