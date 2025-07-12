import type { ApiResponse } from "../../common/api-response";
import type { Word } from "../../database";

export interface PostWordRequest extends Omit<Word, "id"> {}

export interface PostWordResponse extends ApiResponse<Word> {}
