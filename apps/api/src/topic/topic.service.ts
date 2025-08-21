import { Inject, Injectable } from "@nestjs/common";
import { ApiPaginationRequest, Topic } from "@repo/types";
import { Repository } from "typeorm";
import { TOPIC_REPOSITORY } from "../constants/database.constants";
import { TopicEntity } from "./topic.entity";

@Injectable()
export class TopicService {
	constructor(
		@Inject(TOPIC_REPOSITORY)
		private topicRepository: Repository<TopicEntity>,
	) {}

	async findAll(
		query: Partial<Topic> & ApiPaginationRequest,
	): Promise<TopicEntity[]> {
		const { limit, offset, ...rest } = query;

		return this.topicRepository.find({
			where: {
				...rest,
			},
			take: limit || 10,
			skip: offset || 0,
		});
	}

	async findOne(id: TopicEntity["id"]): Promise<TopicEntity | null> {
		return this.topicRepository.findOneBy({ id });
	}

	async create(topic: Omit<Topic, "id">): Promise<TopicEntity> {
		const newTopic = this.topicRepository.create(topic);
		return this.topicRepository.save(newTopic);
	}

	async update({
		id,
		...topic
	}: Omit<Partial<Topic>, "created_at">): Promise<TopicEntity | null> {
		await this.topicRepository.update({ id }, topic);
		return this.findOne(id);
	}

	async remove(id: TopicEntity["id"]): Promise<void> {
		await this.topicRepository.delete({ id });
	}
}
