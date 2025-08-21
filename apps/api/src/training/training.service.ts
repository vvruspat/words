import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { GetTrainingRequestDto } from "~/dto";
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
	}: GetTrainingRequestDto): Promise<TrainingEntity[]> {
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
