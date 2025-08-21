import { Inject, Injectable } from "@nestjs/common";
import type { Repository } from "typeorm";
import { WORDS_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import type { WordTranslationEntity } from "./wordstranslation.entity";

@Injectable()
export class WordTranslationService {
	constructor(
		@Inject(WORDS_TRANSLATION_REPOSITORY)
		private wordsTranslationRepository: Repository<WordTranslationEntity>,
	) {}

	async findAll(): Promise<WordTranslationEntity[]> {
		return this.wordsTranslationRepository.find();
	}

	async findOne(
		id: WordTranslationEntity["id"],
	): Promise<WordTranslationEntity | null> {
		return this.wordsTranslationRepository.findOneBy({ id });
	}

	async create(
		wordsTranslation: Omit<WordTranslationEntity, "id">,
	): Promise<WordTranslationEntity> {
		const newWordTranslation =
			this.wordsTranslationRepository.create(wordsTranslation);
		return this.wordsTranslationRepository.save(newWordTranslation);
	}

	async update(
		id: WordTranslationEntity["id"],
		wordsTranslation: Partial<WordTranslationEntity>,
	): Promise<WordTranslationEntity | null> {
		await this.wordsTranslationRepository.update({ id }, wordsTranslation);
		return this.findOne(id);
	}

	async remove(id: WordTranslationEntity["id"]): Promise<void> {
		await this.wordsTranslationRepository.delete({ id });
	}
}
