import { paths } from "../../../../../api";

export type PostDialoguesByCorrectionsByIdByBranchResponse =
	paths["/dialogues/corrections/{id}/branch"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostDialoguesByCorrectionsByIdByBranchRequest =
	paths["/dialogues/corrections/{id}/branch"]["post"]["parameters"]["path"];
