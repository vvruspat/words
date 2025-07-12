import type { ApiResponse } from "../../common/api-response";
import type { VocabCatalog } from "../../database";

export interface PutVocabCatalogRequest extends VocabCatalog {}

export interface PutVocabCatalogResponse extends ApiResponse<VocabCatalog> {}
