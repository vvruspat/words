import { DataSource, DataSourceOptions } from "typeorm";
import { DATA_SOURCE } from "../constants/database.constants";
import { WordSubscriber } from "../word/word.subscriber";
import { TranslationSubscriber } from "../wordstranslation/wordtranslation.subscriber";

export const databaseProviders = [
	{
		provide: DATA_SOURCE,
		useFactory: async () => {
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
