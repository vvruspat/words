import type { DataSource } from "typeorm";
import {
	DATA_SOURCE,
	TOPIC_TRANSLATION_REPOSITORY,
} from "../constants/database.constants";
import { TopicTranslationEntity } from "./topictranslation.entity";

export const topicTranslationProviders = [
	{
		provide: TOPIC_TRANSLATION_REPOSITORY,
		useFactory: (dataSource: DataSource) =>
			dataSource.getRepository(TopicTranslationEntity),
		inject: [DATA_SOURCE],
	},
];
