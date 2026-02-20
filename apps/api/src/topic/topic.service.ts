import { Inject, Injectable } from "@nestjs/common";
import type {
	ApiPaginationRequest,
	Language,
	Topic,
} from "@vvruspat/words-types";
import type { Repository } from "typeorm";
import {
	TOPIC_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import type { WordEntity } from "../word/word.entity";
import type { TopicEntity } from "./topic.entity";

@Injectable()
export class TopicService {
	constructor(
		@Inject(TOPIC_REPOSITORY)
		private topicRepository: Repository<TopicEntity>,
		@Inject(WORD_REPOSITORY)
		private wordRepository: Repository<WordEntity>,
	) {}

	async findAll(
		query: Partial<Topic> & ApiPaginationRequest,
	): Promise<TopicEntity[]> {
		const { limit, offset, ...rest } = query;
		const where: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(rest)) {
			if (value !== undefined && value !== null && value !== "") {
				where[key] = value;
			}
		}

		return this.topicRepository.find({
			where,
			take: limit || 10,
			skip: offset || 0,
		});
	}

	async findAllAndCreateIfNotExist(
		topics: Topic["title"][],
		language: Language,
	): Promise<TopicEntity[]> {
		const existingTopics = await this.topicRepository.find({
			where: topics.map((title) => ({ title })),
		});

		const existingTitles = new Set(existingTopics.map((t) => t.title));
		const newTitles = topics.filter((title) => !existingTitles.has(title));

		const newTopics = this.topicRepository.create(
			newTitles.map((title) => ({ title, language })),
		);

		if (newTopics.length > 0) {
			await this.topicRepository.save(newTopics);
		}

		return [...existingTopics, ...newTopics];
	}

	async findOne(id: TopicEntity["id"]): Promise<TopicEntity | null> {
		return this.topicRepository.findOneBy({ id });
	}

	async getWordsCountByTopicIds(
		ids: number[],
		language?: string,
	): Promise<Map<number, number>> {
		if (ids.length === 0) {
			return new Map();
		}

		const query = this.wordRepository
			.createQueryBuilder("word")
			.select("word.topic", "topicId")
			.addSelect("COUNT(*)", "count")
			.where("word.topic IN (:...ids)", { ids });

		if (language) {
			query.andWhere("word.language = :language", { language });
		}

		const rows = await query.groupBy("word.topic").getRawMany<{
			topicId: string;
			count: string;
		}>();

		return new Map(rows.map((row) => [Number(row.topicId), Number(row.count)]));
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
