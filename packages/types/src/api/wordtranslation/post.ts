import type { ApiResponse } from "../../common/api-response";
import type { WordsTranslation } from "../../database";

export interface PostWordTranslationRequest
	extends Omit<WordsTranslation, "id"> {}

export interface PostWordTranslationResponse
	extends ApiResponse<WordsTranslation> {}
