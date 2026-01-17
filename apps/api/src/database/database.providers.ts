import { DataSource, DataSourceOptions } from "typeorm";
import { DATA_SOURCE } from "../constants/database.constants";
import { WordSubscriber } from "../word/word.subscriber";
import { TranslationSubscriber } from "../wordstranslation/wordtranslation.subscriber";

export const databaseProviders = [
	{
		provide: DATA_SOURCE,
		useFactory: async () => {
			// Skip database connection during Swagger generation
			if (process.env.SKIP_DB_CONNECTION === "true") {
				// Return an uninitialized DataSource - this prevents connection
				// but maintains type safety. Swagger generation only needs metadata
				// from decorators, not actual database connections.
				const dataSourceOptions: DataSourceOptions = {
					type: "postgres",
					entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
				};
				const dataSource = new DataSource(dataSourceOptions);
				// Don't call initialize() - just return the uninitialized DataSource
				return dataSource;
			}

			let connectionOptions = {};
			const dataSourceOptions: DataSourceOptions = {
				type: "postgres",
				entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
				synchronize: true,
				logging: true,
				logger: "advanced-console",

				subscribers: [WordSubscriber, TranslationSubscriber],
			};

			if (process.env.PG_URL) {
				connectionOptions = {
					url: process.env.PG_URL,
				};
			} else {
				connectionOptions = {
					host: process.env.PG_HOST,
					port: process.env.PG_PORT,
					username: process.env.PG_USER,
					password: process.env.PG_PASSWORD,
					database: process.env.PG_DATABASE,
				};
			}

			const dataSource = new DataSource({
				...dataSourceOptions,
				...connectionOptions,
			});

			return dataSource.initialize();
		},
	},
];
