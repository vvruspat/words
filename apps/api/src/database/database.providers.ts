import { DataSource } from "typeorm";
import { DATA_SOURCE } from "../constants/database.constants";

export const databaseProviders = [
	{
		provide: DATA_SOURCE,
		useFactory: async () => {
			const dataSource = new DataSource({
				type: "postgres",
				host: process.env.PG_HOST || "localhost",
				port: process.env.PG_PORT ? parseInt(process.env.PG_PORT, 10) : 5432,
				username: process.env.PG_USER || "postgres",
				password: process.env.PG_PASSWORD || "postgres",
				database: process.env.PG_DATABASE || "words",
				entities: [`${__dirname}/entities/**/*.entity.ts`],
				synchronize: true,
			});

			return dataSource.initialize();
		},
	},
];
