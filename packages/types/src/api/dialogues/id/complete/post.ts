import { paths } from "../../../../api";

export type PostDialoguesByIdByCompleteResponse =
	paths["/dialogues/{id}/complete"]["post"]["responses"]["201"]["content"]["application/json"];
export type PostDialoguesByIdByCompleteRequest =
	paths["/dialogues/{id}/complete"]["post"]["parameters"]["path"];
