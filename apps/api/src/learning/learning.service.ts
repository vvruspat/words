import { Inject, Injectable } from "@nestjs/common";
import { Learning, LearningData } from "@repo/types";
import { Repository } from "typeorm";
import { GetLearningRequestDto } from "~/dto";
import {
	LEARNING_DATA_REPOSITORY,
	LEARNING_REPOSITORY,
} from "../constants/database.constants";
import { LearningDataEntity, LearningEntity } from "./learning.entity";

@Injectable()
export class LearningService {
	constructor(
		@Inject(LEARNING_REPOSITORY)
		private learningRepository: Repository<LearningEntity>,
		@Inject(LEARNING_DATA_REPOSITORY)
		private learningDataRepository: Repository<LearningDataEntity>,
	) {}

	async findAll(query: GetLearningRequestDto): Promise<LearningData[]> {
		const { limit, offset, ...rest } = query;

		return this.learningDataRepository.find({
			where: { ...rest },
			take: limit || 10,
			skip: offset || 0,
		});
	}

	async findOne(id: Learning["id"]): Promise<LearningData | null> {
		return this.learningDataRepository.findOneBy({ id });
	}

	async create(learning: Omit<Learning, "id">): Promise<Learning> {
		const newLearning = this.learningRepository.create(learning);
		return this.learningRepository.save(newLearning);
	}

	async update(
		learning: Omit<Partial<Learning>, "created_at">,
	): Promise<Learning | null> {
		await this.learningRepository.update({ id: learning.id }, learning);
		return this.findOne(learning.id);
	}

	async remove(id: Learning["id"]): Promise<void> {
		await this.learningRepository.delete({ id });
	}
}
