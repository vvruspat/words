import type { ApiResponse } from "../../common/api-response";
import type { Word } from "../../database";

export interface DeleteWordRequest {
	id: Word["id"];
}

export interface DeleteWordResponse extends ApiResponse<Word> {}
