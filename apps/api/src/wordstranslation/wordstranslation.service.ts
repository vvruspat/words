import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { WORDS_TRANSLATION_REPOSITORY } from "../constants/database.constants";
import { WordsTranslationEntity } from "./wordstranslation.entity";

@Injectable()
export class WordsTranslationService {
	constructor(
		@Inject(WORDS_TRANSLATION_REPOSITORY)
		private wordsTranslationRepository: Repository<WordsTranslationEntity>,
	) {}

	async findAll(): Promise<WordsTranslationEntity[]> {
		return this.wordsTranslationRepository.find();
	}

	async findOne(
		id: WordsTranslationEntity["id"],
	): Promise<WordsTranslationEntity | null> {
		return this.wordsTranslationRepository.findOneBy({ id });
	}

	async create(
		wordsTranslation: Omit<WordsTranslationEntity, "id">,
	): Promise<WordsTranslationEntity> {
		const newWordsTranslation =
			this.wordsTranslationRepository.create(wordsTranslation);
		return this.wordsTranslationRepository.save(newWordsTranslation);
	}

	async update(
		id: WordsTranslationEntity["id"],
		wordsTranslation: Partial<WordsTranslationEntity>,
	): Promise<WordsTranslationEntity | null> {
		await this.wordsTranslationRepository.update({ id }, wordsTranslation);
		return this.findOne(id);
	}

	async remove(id: WordsTranslationEntity["id"]): Promise<void> {
		await this.wordsTranslationRepository.delete({ id });
	}
}
