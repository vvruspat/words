import type { ApiResponse } from "../../common/api-response";
import type { Word } from "../../database";

export interface PutWordRequest extends Word {}

export interface PutWordResponse extends ApiResponse<Word> {}
