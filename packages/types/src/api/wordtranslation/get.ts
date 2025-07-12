import type { PaginatedResponse } from "../../common/api-response";
import type { WordsTranslation } from "../../database";

export interface GetWordTranslationRequest extends Partial<WordsTranslation> {
	limit?: number;
	offset?: number;
}

export interface GetWordTranslationResponse
	extends PaginatedResponse<WordsTranslation> {}
