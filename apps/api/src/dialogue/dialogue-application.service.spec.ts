import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { UserEntity } from "~/user/user.entity";
import type { DialogueTurn } from "./dialogue-ai.service";
import { DialogueApplicationService } from "./dialogue-application.service";

describe("DialogueApplicationService", () => {
	const user = {
		id: 7,
		language_learn: "en",
		language_speak: "ru",
	} as UserEntity;
	let dialogue: Record<string, jest.Mock>;
	let ai: Record<string, jest.Mock>;
	let vocabulary: Record<string, jest.Mock>;
	let service: DialogueApplicationService;

	beforeEach(() => {
		dialogue = {
			getOwnedSession: jest.fn().mockResolvedValue({
				id: "session",
				status: "active",
				turn_count: 0,
				max_turns: 12,
			}),
			getMainThread: jest.fn().mockResolvedValue({ id: "main" }),
			findMessageByClientId: jest.fn().mockResolvedValue(null),
			findAssistantResponse: jest.fn().mockResolvedValue(null),
			appendMessage: jest
				.fn()
				.mockResolvedValueOnce({ id: "user-message", role: "user" })
				.mockResolvedValueOnce({ id: "assistant-message", role: "assistant" }),
			listMessages: jest.fn().mockResolvedValue([]),
			saveCorrections: jest.fn().mockResolvedValue([{ id: "correction" }]),
			incrementTurn: jest.fn().mockResolvedValue({
				id: "session",
				status: "active",
				turn_count: 1,
				max_turns: 12,
			}),
			saveUsage: jest.fn().mockResolvedValue(undefined),
			recordWordEvent: jest.fn().mockResolvedValue(undefined),
			listCorrections: jest.fn().mockResolvedValue([]),
		};
		ai = {
			model: "gpt-4o-mini",
			resolveNativeInsertions: jest.fn(),
			resolveWord: jest
				.fn()
				.mockImplementation(async ({ word }: { word: string }) => ({
					data: {
						items:
							word === "went"
								? [
										{
											word: "went",
											translation: "ходил",
											description: "past form of go",
											transcription: "",
										},
										{
											word: "go",
											translation: "ходить",
											description: "base form",
											transcription: "",
										},
									]
								: [
										{
											word,
											translation: "новый",
											description: "iets dat kort geleden is gemaakt",
											transcription: "",
										},
									],
					},
					usage: { inputTokens: 4, outputTokens: 3, totalTokens: 7 },
					modelId: "gpt-4o-mini",
				})),
			reviewLearnerAnswer: jest
				.fn()
				.mockImplementation(async ({ content }: { content: string }) => ({
					data: {
						correctedAnswer: content,
						overallExplanation: "Фраза уже корректна.",
						corrections: [],
					},
					usage: { inputTokens: 8, outputTokens: 4, totalTokens: 12 },
					modelId: "gpt-4o-mini",
				})),
			generateTurn: jest.fn().mockResolvedValue({
				data: {
					reply: "Good try!",
					translation: "Хорошая попытка!",
					corrections: [
						{
							type: "grammar",
							original: "I goed",
							corrected: "I went",
							shortExplanation: "Неправильный глагол",
							affectedWords: [
								{
									word: "went",
									translation: "ходил",
									description: "past form",
								},
								{ word: "go", translation: "ходить", description: "base form" },
							],
						},
					],
					nativeInsertions: [
						{ word: "ticket", translation: "билет", description: "noun" },
					],
					hints: ["I would like…"],
					shouldWrapUp: false,
					shouldComplete: false,
				},
				usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
				modelId: "gpt-4o-mini",
			}),
		};
		vocabulary = {
			addWords: jest
				.fn()
				.mockImplementation(
					async ({ words }: { words: Array<{ source: string }> }) =>
						words.map((word, index) => ({
							item: { id: `v${index + 1}`, source: word.source },
							source: word.source,
							isNew: true,
						})),
				),
		};
		service = new DialogueApplicationService(
			dialogue as never,
			ai as never,
			vocabulary as never,
		);
	});

	it("adds only corrected surface forms with writing reset and native insertions", async () => {
		await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "I goed with билет",
			clientMessageId: "client-message-1",
		});

		expect(vocabulary.addWords).toHaveBeenCalledWith({
			user,
			sessionId: "session",
			words: [
				{
					word: "ticket",
					translation: "билет",
					description: "noun",
					source: "native_insert",
					resetWriting: true,
				},
				{
					word: "went",
					translation: "ходил",
					description: "past form of go",
					transcription: "",
					source: "correction",
					resetWriting: true,
				},
			],
		});
		expect(dialogue.recordWordEvent).toHaveBeenCalledTimes(2);
		expect(ai.resolveWord).toHaveBeenCalledWith(
			expect.objectContaining({ user, word: "went" }),
		);
	});

	it("replaces a model typo with the word from the corrected version", async () => {
		const generated = await ai.generateTurn();
		ai.generateTurn.mockResolvedValue({
			...generated,
			data: {
				...generated.data,
				corrections: [
					{
						type: "typo",
						original: "neuwe",
						corrected: "nieuwe",
						shortExplanation: "Исправлено написание.",
						affectedWords: [
							{
								word: "neuwe",
								translation: "новый",
								description: "iets dat kort geleden is gemaakt",
								transcription: "",
							},
						],
					},
				],
				nativeInsertions: [],
			},
		});
		ai.reviewLearnerAnswer.mockResolvedValue({
			data: {
				correctedAnswer: "Het nieuwe project is interessant.",
				overallExplanation: "Исправлено написание.",
				corrections: [],
			},
			usage: { inputTokens: 8, outputTokens: 4, totalTokens: 12 },
			modelId: "gpt-4o-mini",
		});

		await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "Het neuwe project is interessant.",
			clientMessageId: "client-message-typo",
		});

		expect(vocabulary.addWords).toHaveBeenCalledWith({
			user,
			sessionId: "session",
			words: [
				expect.objectContaining({
					word: "nieuwe",
					translation: "новый",
					source: "correction",
				}),
			],
		});
		expect(ai.resolveWord).toHaveBeenCalledWith({
			user,
			word: "nieuwe",
			context: "Het nieuwe project is interessant.",
		});
	});

	it("adds grammar corrections found by the independent full-answer audit", async () => {
		const generated = await ai.generateTurn();
		ai.generateTurn.mockResolvedValue({
			...generated,
			data: {
				...generated.data,
				corrections: [
					{
						type: "typo",
						original: "ranen",
						corrected: "runnen",
						shortExplanation: "Исправлено написание.",
						affectedWords: [],
					},
				],
				nativeInsertions: [],
			},
		});
		ai.reviewLearnerAnswer.mockResolvedValue({
			data: {
				correctedAnswer: "Alleen één GitLab-pipeline uitvoeren.",
				overallExplanation: "Исправлено построение предложения.",
				corrections: [
					{
						type: "grammar",
						original: "Slecht enkel de gitlab pipeline",
						corrected: "Alleen één GitLab-pipeline",
						shortExplanation:
							"Исправлены определитель и естественная конструкция.",
						affectedWords: [],
					},
					{
						type: "vocabulary",
						original: "ranen",
						corrected: "uitvoeren",
						shortExplanation: "Для запуска процесса используется uitvoeren.",
						affectedWords: [],
					},
				],
			},
			usage: { inputTokens: 8, outputTokens: 4, totalTokens: 12 },
			modelId: "gpt-4o-mini",
		});
		vocabulary.addWords.mockResolvedValue([]);

		await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "Slecht enkel de gitlab pipeline ranen.",
			clientMessageId: "client-message-grammar",
		});

		expect(dialogue.saveCorrections).toHaveBeenCalledWith(
			expect.objectContaining({
				items: [
					expect.objectContaining({
						type: "grammar",
						original: "Slecht enkel de gitlab pipeline ranen",
						corrected: "Alleen één GitLab-pipeline uitvoeren",
					}),
				],
			}),
		);
		expect(ai.reviewLearnerAnswer).toHaveBeenCalledWith({
			user,
			content: "Slecht enkel de gitlab pipeline ranen.",
			detectedNativeTerms: [],
			messages: [],
		});
	});

	it("turns an overlapping full-answer audit into non-overlapping phrase ranges", () => {
		const content =
			"Slecht enkel de gitlab pipeline ranen. Alleen een command release";
		const buildReviewedCorrections = (
			service as unknown as {
				buildReviewedCorrections: (input: {
					content: string;
					correctedAnswer: string;
					overallExplanation: string;
					detectedNativeTerms: string[];
					evidence: DialogueTurn["corrections"];
				}) => DialogueTurn["corrections"];
			}
		).buildReviewedCorrections.bind(service);

		const corrections = buildReviewedCorrections({
			content,
			correctedAnswer:
				"Slecht, alleen de GitLab-pipeline draait. Alleen één commando: release.",
			overallExplanation: "Исправлено построение предложения.",
			detectedNativeTerms: [],
			evidence: [
				{
					type: "grammar",
					original: "enkel",
					corrected: "alleen",
					shortExplanation: "Исправлен выбор ограничительного слова.",
					affectedWords: [],
				},
				{
					type: "grammar",
					original: "gitlab pipeline ranen",
					corrected: "GitLab-pipeline draait",
					shortExplanation: "Исправлена глагольная конструкция.",
					affectedWords: [],
				},
				{
					type: "grammar",
					original: "Slecht enkel de gitlab pipeline",
					corrected: "Slecht werkt alleen de GitLab-pipeline",
					shortExplanation: "Исправлен порядок слов.",
					affectedWords: [],
				},
			],
		});

		expect(corrections).toEqual([
			expect.objectContaining({ original: "enkel", corrected: ", alleen" }),
			expect.objectContaining({
				original: "gitlab pipeline ranen",
				corrected: "GitLab-pipeline draait",
			}),
			expect.objectContaining({
				original: "een command",
				corrected: "één commando:",
			}),
		]);
		for (let left = 0; left < corrections.length; left += 1) {
			const leftStart = content.indexOf(corrections[left].original);
			const leftEnd = leftStart + corrections[left].original.length;
			for (let right = left + 1; right < corrections.length; right += 1) {
				const rightStart = content.indexOf(corrections[right].original);
				expect(leftEnd).toBeLessThanOrEqual(rightStart);
			}
		}
	});

	it("resolves a detected native term when the turn model omits it", async () => {
		ai.generateTurn.mockResolvedValue({
			data: {
				reply: "I understand.",
				translation: "Я понимаю.",
				corrections: [],
				nativeInsertions: [],
				hints: [],
				shouldWrapUp: false,
				shouldComplete: false,
			},
			usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
			modelId: "gpt-4o-mini",
		});
		ai.resolveNativeInsertions.mockResolvedValue({
			data: {
				items: [
					{
						original: "бедный",
						target: {
							word: "poor",
							translation: "бедный",
							description: "adjective describing someone without much money",
							transcription: "",
						},
						shortExplanation: "В этом предложении нужно использовать poor.",
					},
				],
			},
			usage: { inputTokens: 4, outputTokens: 3, totalTokens: 7 },
			modelId: "gpt-4o-mini",
		});
		vocabulary.addWords.mockResolvedValue([
			{
				item: { id: "native", source: "native_insert" },
				source: "native_insert",
				isNew: true,
			},
		]);

		await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "I am бедный",
			clientMessageId: "client-message-2",
		});

		expect(ai.generateTurn).toHaveBeenCalledWith(
			expect.objectContaining({ detectedNativeTerms: ["бедный"] }),
		);
		expect(ai.resolveNativeInsertions).toHaveBeenCalledWith({
			user,
			terms: ["бедный"],
			context: "I am бедный",
		});
		expect(dialogue.saveCorrections).toHaveBeenCalledWith(
			expect.objectContaining({
				items: [
					expect.objectContaining({
						type: "vocabulary",
						original: "бедный",
						corrected: "poor",
					}),
				],
			}),
		);
		expect(vocabulary.addWords).toHaveBeenCalledWith({
			user,
			sessionId: "session",
			words: [
				expect.objectContaining({
					word: "poor",
					translation: "бедный",
					source: "native_insert",
					resetWriting: true,
				}),
			],
		});
		expect(ai.resolveWord).not.toHaveBeenCalled();
	});

	it("repairs a native insertion returned in the wrong direction", async () => {
		const generated = await ai.generateTurn();
		ai.generateTurn.mockResolvedValue({
			...generated,
			data: {
				...generated.data,
				corrections: [],
				nativeInsertions: [
					{
						word: "бедный",
						translation: "poor",
						description: "adjective describing someone without much money",
						transcription: "",
					},
				],
			},
		});
		vocabulary.addWords.mockResolvedValue([
			{
				item: { id: "native", source: "native_insert" },
				source: "native_insert",
				isNew: true,
			},
		]);

		await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "I am бедный",
			clientMessageId: "client-message-3",
		});

		expect(ai.resolveNativeInsertions).not.toHaveBeenCalled();
		expect(vocabulary.addWords).toHaveBeenCalledWith(
			expect.objectContaining({
				words: expect.arrayContaining([
					expect.objectContaining({ word: "poor", translation: "бедный" }),
				]),
			}),
		);
	});

	it("returns an existing turn without calling the model again", async () => {
		dialogue.findMessageByClientId.mockResolvedValue({ id: "existing-user" });
		dialogue.findAssistantResponse.mockResolvedValue({ id: "existing-answer" });

		const result = await service.sendMainMessage({
			user,
			authorization: "Bearer token",
			sessionId: "session",
			content: "retry",
			clientMessageId: "client-message-1",
		});

		expect(ai.generateTurn).not.toHaveBeenCalled();
		expect(result.assistantMessage).toEqual({ id: "existing-answer" });
	});
});
