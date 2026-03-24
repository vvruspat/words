import { paths } from "../../../api";

export type DeleteReportByIdResponse =
	paths["/report/{id}"]["delete"]["responses"]["200"]["content"]["application/json"];
export type DeleteReportByIdRequest =
	paths["/report/{id}"]["delete"]["parameters"]["path"];
