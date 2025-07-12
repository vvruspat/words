import { Inject, Injectable } from "@nestjs/common";
import type { GetWordRequest } from "@repo/types";
import type { Repository } from "typeorm";
import {
	WORD_DATA_REPOSITORY,
	WORD_REPOSITORY,
} from "../constants/database.constants";
import type { WordDataEntity, WordEntity } from "./word.entity";

@Injectable()
export class WordService {
	constructor(
		@Inject(WORD_REPOSITORY)
		private wordRepository: Repository<WordEntity>,
		@Inject(WORD_DATA_REPOSITORY)
		private wordDataRepository: Repository<WordDataEntity>,
	) {}

	async findAll(query: GetWordRequest): Promise<WordDataEntity[]> {
		const { limit, offset, ...restQuery } = query;

		return this.wordDataRepository.find({
			where: { ...restQuery },
			take: limit ?? 10,
			skip: offset ?? 0,
		});
	}

	async findOne(id: WordEntity["id"]): Promise<WordDataEntity | null> {
		return this.wordDataRepository.findOneBy({ id });
	}

	async create(word: Omit<WordEntity, "id">): Promise<WordEntity> {
		const newWord = this.wordRepository.create(word);
		return this.wordRepository.save(newWord);
	}

	async update(word: Partial<WordEntity>): Promise<WordEntity | null> {
		await this.wordRepository.update({ id: word.id }, word);
		return this.findOne(word.id);
	}

	async remove(id: WordEntity["id"]): Promise<void> {
		await this.wordRepository.delete({ id });
	}
}
