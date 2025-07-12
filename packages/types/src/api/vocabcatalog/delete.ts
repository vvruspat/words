import type { ApiResponse } from "../../common/api-response";
import type { VocabCatalog } from "../../database";

export interface DeleteVocabCatalogRequest {
	id: VocabCatalog["id"];
}

export interface DeleteVocabCatalogResponse extends ApiResponse<VocabCatalog> {}
