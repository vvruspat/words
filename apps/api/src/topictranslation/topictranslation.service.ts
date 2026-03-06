import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Queue } from "bullmq";
import type { FindOptionsWhere, Repository } from "typeorm";
import { In } from "typeorm";
import { TOPIC_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import { TOPIC_TRANSLATION_START } from "../constants/queue-events.constants";
import { OPENAI_QUEUE } from "../constants/queues.constants";
import type { TopicEntity } from "../topic/topic.entity";
import type { TopicTranslationEntity } from "./topictranslation.entity";
import type { GeneratedTopicTranslation } from "./types/generated-topic-translations";

@Injectable()
export class TopicTranslationService {
	private readonly logger = new Logger(TopicTranslationService.name);

	constructor(
		@Inject(TOPIC_TRANSLATION_REPOSITORY)
		private topicTranslationRepository: Repository<TopicTranslationEntity>,
		@InjectQueue(OPENAI_QUEUE) private openAIQueue: Queue,
	) {}

	async findAll(
		filters: Partial<TopicTranslationEntity> & {
			topics?: TopicTranslationEntity["topic"][] | string;
		},
	): Promise<TopicTranslationEntity[]> {
		const { topics, ...restFilters } = filters;
		const where: FindOptionsWhere<TopicTranslationEntity> = {
			...restFilters,
		} as FindOptionsWhere<TopicTranslationEntity>;

		if (topics !== undefined) {
			let topicIds: number[];

			if (Array.isArray(topics)) {
				topicIds = topics.map((t) =>
					typeof t === "string" ? parseInt(t, 10) : t,
				);
			} else if (typeof topics === "string") {
				topicIds = topics.split(",").map((t) => parseInt(t.trim(), 10));
			} else {
				topicIds = [topics];
			}

			topicIds = topicIds.filter((id) => !Number.isNaN(id));
			if (topicIds.length > 0) {
				where.topic = In(topicIds);
			}
		}

		return this.topicTranslationRepository.find({ where });
	}

	async count(
		filters: Partial<TopicTranslationEntity> & {
			topics?: TopicTranslationEntity["topic"][] | string;
		},
	): Promise<number> {
		const { topics, ...restFilters } = filters;
		const where: FindOptionsWhere<TopicTranslationEntity> = {
			...restFilters,
		} as FindOptionsWhere<TopicTranslationEntity>;

		if (topics !== undefined) {
			let topicIds: number[];

			if (Array.isArray(topics)) {
				topicIds = topics.map((t) =>
					typeof t === "string" ? parseInt(t, 10) : t,
				);
			} else if (typeof topics === "string") {
				topicIds = topics.split(",").map((t) => parseInt(t.trim(), 10));
			} else {
				topicIds = [topics];
			}

			topicIds = topicIds.filter((id) => !Number.isNaN(id));
			if (topicIds.length > 0) {
				where.topic = In(topicIds);
			}
		}

		return this.topicTranslationRepository.count({ where });
	}

	async findOne(
		id: TopicTranslationEntity["id"],
	): Promise<TopicTranslationEntity | null> {
		return this.topicTranslationRepository.findOneBy({ id });
	}

	async create(
		topicTranslation: Omit<TopicTranslationEntity, "id">,
	): Promise<TopicTranslationEntity> {
		const newTopicTranslation =
			this.topicTranslationRepository.create(topicTranslation);
		return this.topicTranslationRepository.save(newTopicTranslation);
	}

	async update(
		id: TopicTranslationEntity["id"],
		topicTranslation: Partial<TopicTranslationEntity>,
	): Promise<TopicTranslationEntity | null> {
		await this.topicTranslationRepository.update({ id }, topicTranslation);
		return this.findOne(id);
	}

	async remove(id: TopicTranslationEntity["id"]): Promise<void> {
		await this.topicTranslationRepository.delete({ id });
	}

	async removeByTopicId(
		topicId: TopicTranslationEntity["topic"],
	): Promise<void> {
		await this.topicTranslationRepository.delete({ topic: topicId });
	}

	async makeTranslations(topics: TopicEntity[]): Promise<void> {
		this.logger.log(
			`Enqueuing topic translation job for: ${topics.map((t) => t.title).join(", ")}`,
		);
		this.openAIQueue.add(TOPIC_TRANSLATION_START, {
			topics,
			language: topics[0].language,
		});
	}

	async translationsMade(
		generatedTranslations: GeneratedTopicTranslation[],
		topics: TopicEntity[],
	): Promise<void> {
		this.logger.log(
			`Storing generated translations for topics: ${topics.map((t) => t.title).join(", ")}`,
		);
		const topicsMap = new Map<string, TopicEntity>(
			topics.map((topic) => [topic.title, topic]),
		);

		for (const topicWithTranslations of generatedTranslations) {
			const topic = topicsMap.get(topicWithTranslations.topic);
			if (!topic) {
				this.logger.error(
					`Topic "${topicWithTranslations.topic}" not found in topics map`,
				);
				continue;
			}

			for (const translationItem of topicWithTranslations.translations) {
				const existing = await this.topicTranslationRepository.findOne({
					where: { topic: topic.id, language: translationItem.language },
				});

				if (existing) {
					await this.topicTranslationRepository.update(existing.id, {
						translation: translationItem.translation,
					});
				} else {
					await this.create({
						topic: topic.id,
						translation: translationItem.translation,
						language: translationItem.language,
						created_at: new Date().toISOString(),
					});
				}
			}
		}
	}
}
