import { paths } from "../../../api";

export type DeleteTopicTranslationByIdResponse =
	paths["/topic-translation/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
export type DeleteTopicTranslationByIdRequest =
	paths["/topic-translation/{id}"]["delete"]["parameters"]["path"];
