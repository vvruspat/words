import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Language } from "@vvruspat/words-types";
import type { Repository } from "typeorm";
import { USER_VOCABULARY_REPOSITORY } from "~/constants/database.constants";
import { LearningService } from "~/learning/learning.service";
import { TopicService } from "~/topic/topic.service";
import type { UserEntity } from "~/user/user.entity";
import { VocabCatalogService } from "~/vocabcatalog/vocabcatalog.service";
import { WordService } from "~/word/word.service";
import { WordTranslationService } from "~/wordstranslation/wordstranslation.service";
import type { UserVocabularyEntity } from "./user-vocabulary.entity";

export type VocabularyWordSource =
	| "click"
	| "native_insert"
	| "correction"
	| "manual";

export type ResolvedVocabularyWord = {
	word: string;
	translation: string;
	description?: string;
	transcription?: string;
	source?: VocabularyWordSource;
	resetWriting?: boolean;
};

@Injectable()
export class UserVocabularyService {
	private readonly logger = new Logger(UserVocabularyService.name);

	constructor(
		@Inject(USER_VOCABULARY_REPOSITORY)
		private readonly repository: Repository<UserVocabularyEntity>,
		private readonly wordService: WordService,
		private readonly translationService: WordTranslationService,
		private readonly topicService: TopicService,
		private readonly catalogService: VocabCatalogService,
		private readonly learningService: LearningService,
	) {}

	async list(user: UserEntity, language = user.language_learn) {
		const items = await this.repository
			.createQueryBuilder("vocabulary")
			.innerJoinAndSelect("vocabulary.wordData", "word")
			.where("vocabulary.user = :userId", { userId: user.id })
			.andWhere("word.language = :language", { language })
			.orderBy("vocabulary.created_at", "DESC")
			.getMany();

		const translations = await this.translationService.findAll({
			words: items.map((item) => item.word),
			language: user.language_speak,
		});
		const byWord = new Map(translations.map((item) => [item.word, item]));

		return items.map((item) => ({
			...item,
			translation: byWord.get(item.word) ?? null,
		}));
	}

	async addWords({
		user,
		words,
		sessionId,
	}: {
		user: UserEntity;
		words: ResolvedVocabularyWord[];
		sessionId?: string;
	}) {
		const result = [];
		for (const input of this.dedupe(words)) {
			result.push(await this.addWord({ user, input, sessionId }));
		}
		return result;
	}

	async getByWord(userId: number, wordId: number) {
		return this.repository.findOne({
			where: { user: userId, word: wordId },
			relations: ["wordData"],
		});
	}

	async getById(userId: number, id: string) {
		return this.repository.findOne({
			where: { id, user: userId },
			relations: ["wordData"],
		});
	}

	async remove(userId: number, id: string): Promise<void> {
		const item = await this.repository.findOne({
			where: { id, user: userId },
			relations: ["wordData"],
		});
		if (!item) throw new NotFoundException("Vocabulary item not found");

		await this.repository.delete({ id: item.id, user: userId });
		if (
			item.wordData.visibility === "private" &&
			item.wordData.owner === userId
		) {
			await this.learningService.removeByUserWord(userId, item.word);
			await this.wordService.remove(item.word);
		}
	}

	private async addWord({
		user,
		input,
		sessionId,
	}: {
		user: UserEntity;
		input: ResolvedVocabularyWord;
		sessionId?: string;
	}) {
		const normalized = this.normalize(input.word);
		let word = await this.wordService.findVisibleByText(
			normalized,
			user.language_learn,
			user.id,
		);
		let translation = word
			? (
					await this.translationService.findAll({
						word: word.id,
						language: user.language_speak,
					})
				)[0]
			: undefined;

		// A model-generated personal translation must never mutate a global word.
		// When the curriculum has no translation for this language pair, keep the
		// generated word and translation together in the learner's private catalog.
		if (word?.visibility === "global" && !translation) word = null;

		if (!word) {
			const [topic, catalog] = await Promise.all([
				this.topicService.findOrCreatePrivateTopic(
					user.id,
					user.language_learn,
				),
				this.catalogService.findOrCreatePrivateCatalog(
					user.id,
					user.language_learn,
				),
			]);

			word = await this.wordService.create({
				created_at: new Date().toISOString(),
				topic: topic.id,
				catalog: catalog.id,
				word: normalized,
				language: user.language_learn as Language,
				audio: "",
				transcription: input.transcription ?? "",
				score: 0,
				status: "processing",
				meaning: input.description,
				owner: user.id,
				visibility: "private",
				source: "dialogue",
			});
			translation = undefined;
			void this.wordService
				.makeAudio(word.language, word.word, word.id)
				.catch((error) =>
					this.logger.warn(
						`Could not queue audio for word ${word?.id}: ${error}`,
					),
				);
			void this.wordService
				.makeEmbedding(word.id, word.word)
				.catch((error) =>
					this.logger.warn(
						`Could not queue embedding for word ${word?.id}: ${error}`,
					),
				);
		}

		const description = input.description?.trim();
		if (
			word.visibility === "private" &&
			word.owner === user.id &&
			description &&
			description !== word.meaning
		) {
			word =
				(await this.wordService.update({
					id: word.id,
					meaning: description,
				})) ?? word;
		}

		translation ??= (
			await this.translationService.findAll({
				word: word.id,
				language: user.language_speak,
			})
		)[0];
		if (!translation) {
			translation = await this.translationService.create({
				created_at: new Date().toISOString(),
				word: word.id,
				translation: input.translation,
				language: user.language_speak,
			});
		}

		let item = await this.repository.findOneBy({
			user: user.id,
			word: word.id,
		});
		const isNew = !item;
		if (!item) {
			item = await this.repository.save(
				this.repository.create({
					user: user.id,
					word: word.id,
					source: input.source ?? "manual",
					source_session_id: sessionId,
				}),
			);
		}

		const progress = await this.learningService.addWordFromDialogue({
			userId: user.id,
			wordId: word.id,
			translationId: translation.id,
			resetWriting: input.resetWriting,
		});

		return {
			item,
			word,
			translation,
			progress,
			isNew,
			source: input.source ?? item.source,
		};
	}

	private dedupe(words: ResolvedVocabularyWord[]) {
		const seen = new Set<string>();
		return words.filter((word) => {
			const key = this.normalize(word.word).toLocaleLowerCase();
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	private normalize(word: string) {
		return word.trim().replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");
	}
}
