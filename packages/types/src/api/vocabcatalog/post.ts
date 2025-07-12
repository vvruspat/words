import type { ApiResponse } from "../../common/api-response";
import type { VocabCatalog } from "../../database";

export interface PostVocabCatalogRequest extends Omit<VocabCatalog, "id"> {}

export interface PostVocabCatalogResponse extends ApiResponse<VocabCatalog> {}
