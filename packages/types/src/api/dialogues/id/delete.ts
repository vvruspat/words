import { paths } from "../../../api";

export type DeleteDialoguesByIdResponse =
	paths["/dialogues/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
export type DeleteDialoguesByIdRequest =
	paths["/dialogues/{id}"]["delete"]["parameters"]["path"];
