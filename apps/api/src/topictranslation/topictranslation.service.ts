import { Inject, Injectable } from "@nestjs/common";
import type { FindOptionsWhere, Repository } from "typeorm";
import { In } from "typeorm";
import { TOPIC_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import type { TopicTranslationEntity } from "./topictranslation.entity";

@Injectable()
export class TopicTranslationService {
	constructor(
		@Inject(TOPIC_TRANSLATION_REPOSITORY)
		private topicTranslationRepository: Repository<TopicTranslationEntity>,
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
}
