import { Inject, Injectable } from "@nestjs/common";
import type { Learning, LearningData } from "@vvruspat/words-types";
import type { Repository } from "typeorm";
import type { GetLearningRequestDto } from "~/dto";
import { LEARNING_REPOSITORY } from "../constants/database.constants";
import type { LearningEntity } from "./learning.entity";

@Injectable()
export class LearningService {
	constructor(
		@Inject(LEARNING_REPOSITORY)
		private learningRepository: Repository<LearningEntity>,
	) {}

	async findAll(query: GetLearningRequestDto): Promise<LearningData[]> {
		const { limit, offset, ...rest } = query;

		return this.learningRepository.find({
			where: { ...rest },
			relations: ["wordData", "trainingData", "translationData"],
			take: limit || 10,
			skip: offset || 0,
		});
	}

	async findOne(id: Learning["id"]): Promise<LearningData | null> {
		return this.learningRepository.findOne({
			where: { id },
			relations: ["wordData", "trainingData", "translationData"],
		});
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
