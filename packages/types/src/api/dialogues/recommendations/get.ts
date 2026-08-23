import { paths } from "../../../api";

export type GetDialoguesByRecommendationsResponse =
	paths["/dialogues/recommendations"]["get"]["responses"]["200"]["content"]["application/json"];
