import { DATA_SOURCE, USER_REPOSITORY } from "src/constants/database.constants";
import type { DataSource } from "typeorm";
import { UserEntity } from "./user.entity";

export const userProviders = [
	{
		provide: USER_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(UserEntity),
		inject: [DATA_SOURCE],
	},
];
