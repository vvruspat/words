import { DataSource } from "typeorm";
import { DATA_SOURCE } from "../constants/database.constants";
import { WordSubscriber } from "../word/word.subscriber";
import { TranslationSubscriber } from "../wordstranslation/wordtranslation.subscriber";

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
				entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
				synchronize: true,
				logging: true,
				logger: "advanced-console",

				subscribers: [WordSubscriber, TranslationSubscriber],
			});

			return dataSource.initialize();
		},
	},
];
