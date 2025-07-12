import { TOPIC_REPOSITORY } from "../constants/database.constants";
import { TopicEntity } from "./topic.entity";

export const topicProviders = [
	{
		provide: TOPIC_REPOSITORY,
		useValue: TopicEntity,
	},
];
