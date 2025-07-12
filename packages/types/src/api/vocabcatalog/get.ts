import type { PaginatedResponse } from "../../common/api-response";
import type { VocabCatalog } from "../../database";

export interface GetVocabCatalogRequest
	extends Partial<Omit<VocabCatalog, "description">> {
	limit?: number;
	offset?: number;
}

export interface GetVocabCatalogResponse
	extends PaginatedResponse<VocabCatalog> {}
