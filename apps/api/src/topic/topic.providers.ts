import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	TOPIC_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import { WordEntity } from "../word/word.entity";
import { TopicEntity } from "./topic.entity";

export const topicProviders = [
	{
		provide: TOPIC_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(TopicEntity),
		inject: [DATA_SOURCE],
	},
	{
		provide: WORD_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(WordEntity),
		inject: [DATA_SOURCE],
	},
];
