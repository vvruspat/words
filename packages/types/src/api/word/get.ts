import { ApiPaginationRequest } from "../../common/api-list-request";

import type { PaginatedResponse } from "../../common/api-response";
import type { Word, WordData } from "../../database";

export interface GetWordRequest extends ApiPaginationRequest, Partial<Word> {}

export interface GetWordResponse extends PaginatedResponse<WordData> {}
