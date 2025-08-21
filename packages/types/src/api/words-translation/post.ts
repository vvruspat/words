import { paths } from "../../api";

export type PostWordsTranslationResponse = paths["/words-translation"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostWordsTranslationRequest = paths["/words-translation"]["post"]["requestBody"]["content"]["application/json"];
