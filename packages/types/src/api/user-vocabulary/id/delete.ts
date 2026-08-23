import { paths } from "../../../api";

export type DeleteUserVocabularyByIdResponse =
	paths["/user-vocabulary/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
export type DeleteUserVocabularyByIdRequest =
	paths["/user-vocabulary/{id}"]["delete"]["parameters"]["path"];
