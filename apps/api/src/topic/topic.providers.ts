import type { DataSource } from "typeorm";
import { DATA_SOURCE, TOPIC_REPOSITORY } from "../constants/database.constants";
import { TopicEntity } from "./topic.entity";

export const topicProviders = [
	{
		provide: TOPIC_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(TopicEntity),
		inject: [DATA_SOURCE],
	},
];
