import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { UserEntity } from "~/user/user.entity";
import { UserVocabularyService } from "./user-vocabulary.service";

describe("UserVocabularyService", () => {
	const user = {
		id: 7,
		language_learn: "en",
		language_speak: "ru",
	} as UserEntity;
	let repository: Record<string, jest.Mock>;
	let wordService: Record<string, jest.Mock>;
	let translationService: Record<string, jest.Mock>;
	let topicService: Record<string, jest.Mock>;
	let catalogService: Record<string, jest.Mock>;
	let learningService: Record<string, jest.Mock>;
	let service: UserVocabularyService;

	beforeEach(() => {
		repository = {
			findOneBy: jest.fn().mockResolvedValue(null),
			create: jest.fn((value) => value),
			save: jest
				.fn()
				.mockImplementation(async (value) => ({ id: "v1", ...value })),
		};
		wordService = {
			findVisibleByText: jest.fn().mockResolvedValue({
				id: 1,
				word: "ticket",
				language: "en",
				visibility: "global",
			}),
			create: jest.fn().mockResolvedValue({
				id: 2,
				word: "ticket",
				language: "en",
				visibility: "private",
			}),
			makeAudio: jest.fn().mockResolvedValue(undefined),
			makeEmbedding: jest.fn().mockResolvedValue(undefined),
			update: jest.fn().mockImplementation(async (value) => ({
				id: 2,
				word: "ticket",
				language: "en",
				visibility: "private",
				owner: user.id,
				...value,
			})),
		};
		translationService = {
			findAll: jest.fn().mockResolvedValue([]),
			create: jest.fn().mockResolvedValue({
				id: 3,
				word: 2,
				translation: "билет",
				language: "ru",
			}),
		};
		topicService = {
			findOrCreatePrivateTopic: jest.fn().mockResolvedValue({ id: 4 }),
		};
		catalogService = {
			findOrCreatePrivateCatalog: jest.fn().mockResolvedValue({ id: 5 }),
		};
		learningService = {
			addWordFromDialogue: jest.fn().mockResolvedValue({
				intro: { id: 6 },
				writing: null,
			}),
		};
		service = new UserVocabularyService(
			repository as never,
			wordService as never,
			translationService as never,
			topicService as never,
			catalogService as never,
			learningService as never,
		);
	});

	it("keeps a generated translation private when the global word has none", async () => {
		await service.addWords({
			user,
			words: [
				{
					word: "ticket",
					translation: "билет",
					description: "существительное",
					source: "click",
				},
			],
		});

		expect(wordService.create).toHaveBeenCalledWith(
			expect.objectContaining({
				word: "ticket",
				owner: user.id,
				visibility: "private",
			}),
		);
		expect(translationService.create).toHaveBeenCalledWith(
			expect.objectContaining({ word: 2, translation: "билет" }),
		);
		expect(translationService.create).not.toHaveBeenCalledWith(
			expect.objectContaining({ word: 1 }),
		);
	});

	it("refreshes a private word with a new monolingual description", async () => {
		wordService.findVisibleByText.mockResolvedValue({
			id: 2,
			word: "ticket",
			language: "en",
			visibility: "private",
			owner: user.id,
			meaning: "перевод слова",
		});
		translationService.findAll.mockResolvedValue([
			{ id: 3, word: 2, translation: "билет", language: "ru" },
		]);

		await service.addWords({
			user,
			words: [
				{
					word: "ticket",
					translation: "билет",
					description: "a piece of paper that lets you enter or travel",
					source: "click",
				},
			],
		});

		expect(wordService.update).toHaveBeenCalledWith({
			id: 2,
			meaning: "a piece of paper that lets you enter or travel",
		});
	});
});
