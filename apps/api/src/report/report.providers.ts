import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	REPORT_REPOSITORY,
} from "../constants/database.constants";
import { ReportEntity } from "./report.entity";

export const reportProviders = [
	{
		provide: REPORT_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(ReportEntity),
		inject: [DATA_SOURCE],
	},
];
