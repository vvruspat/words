import type { ApiResponse } from "../../common/api-response";
import type { WordsTranslation } from "../../database";

export interface PutWordTranslationRequest extends WordsTranslation {}

export interface PutWordTranslationResponse
	extends ApiResponse<WordsTranslation> {}
