import type { ApiResponse } from "../../common/api-response";
import type { WordsTranslation } from "../../database";

export interface DeleteWordTranslationRequest {
	id: WordsTranslation["id"];
}

export interface DeleteWordTranslationResponse
	extends ApiResponse<WordsTranslation> {}
