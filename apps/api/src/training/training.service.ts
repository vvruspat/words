import { Inject, Injectable } from "@nestjs/common";
import { GetTrainingRequest } from "@repo/types";
import { Repository } from "typeorm";
import { TRAINING_REPOSITORY } from "../constants/database.constants";
import { TrainingEntity } from "./training.entity";

@Injectable()
export class TrainingService {
	constructor(
		@Inject(TRAINING_REPOSITORY)
		private trainingRepository: Repository<TrainingEntity>,
	) {}

	async findAll({
		limit,
		offset,
		...query
	}: GetTrainingRequest): Promise<TrainingEntity[]> {
		return this.trainingRepository.find({
			where: {
				...query,
			},
			skip: offset,
			take: limit,
		});
	}

	async findOne(id: TrainingEntity["id"]): Promise<TrainingEntity | null> {
		return this.trainingRepository.findOneBy({ id });
	}

	async create(training: Omit<TrainingEntity, "id">): Promise<TrainingEntity> {
		const newTraining = this.trainingRepository.create(training);
		return this.trainingRepository.save(newTraining);
	}

	async update(
		training: Partial<TrainingEntity>,
	): Promise<TrainingEntity | null> {
		await this.trainingRepository.update({ id: training.id }, training);
		return this.findOne(training.id);
	}

	async remove(id: TrainingEntity["id"]): Promise<void> {
		await this.trainingRepository.delete({ id });
	}
}
