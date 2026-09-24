import { paths } from "../../../api";

export type GetDialoguesByIdResponse =
	paths["/dialogues/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
export type GetDialoguesByIdRequest =
	paths["/dialogues/{id}"]["get"]["parameters"]["path"];
