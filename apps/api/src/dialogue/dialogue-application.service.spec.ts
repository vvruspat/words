import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { UserEntity } from "~/user/user.entity";
import { DialogueApplicationService } from "./dialogue-application.service";

describe("DialogueApplicationService", () => {
	const user = {
		id: 7,
		language_learn: "nl",
		language_speak: "ru",
	} as UserEntity;
	const request = {
		user,
		authorization: "Bearer token",
		sessionId: "session",
		content: "Ik wil eet суп.",
		clientMessageId: "client-message-1",
	};
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
				.mockImplementation(
					async (input: { role: string; content: string }) => ({
						id: `${input.role}-message`,
						...input,
					}),
				),
			listMessages: jest
				.fn()
				.mockResolvedValue([{ role: "user", content: request.content }]),
			saveCorrections: jest.fn().mockResolvedValue([{ id: "correction" }]),
			incrementTurn: jest.fn().mockResolvedValue({
				id: "session",
				status: "active",
				turn_count: 1,
				max_turns: 12,
			}),
			saveUsage: jest.fn().mockResolvedValue(undefined),
			recordWordEvent: jest.fn(),
			listCorrections: jest.fn().mockResolvedValue([]),
		};
		ai = {
			model: "gpt-5-nano",
			generateTurn: jest.fn().mockResolvedValue({
				data: {
					teacherNote: "После wil нужен инфинитив.",
					reply: "Welke soep wilt u?",
					translation: "Какой суп вы хотите?",
					focusWords: ["soep"],
					correctedAnswer: "Ik wil soep eten.",
					correctionExplanation:
						"После wil — eten, дополнение перед инфинитивом.",
					corrections: [
						{
							type: "grammar",
							original: "eet суп",
							corrected: "soep eten",
							shortExplanation: "Исправлены форма глагола и порядок слов.",
						},
					],
					hints: [],
					shouldWrapUp: false,
					shouldComplete: false,
				},
				modelMessages: [{ role: "assistant", content: "model response" }],
				addedWords: [],
				usage: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
				modelId: "gpt-5-nano",
			}),
		};
		vocabulary = { addWords: jest.fn() };
		service = new DialogueApplicationService(
			dialogue as never,
			ai as never,
			vocabulary as never,
		);
	});

	it("does not detect or save vocabulary implicitly, even with a native-language insertion", async () => {
		const result = await service.sendMainMessage(request);
		expect(ai.generateTurn).toHaveBeenCalledWith({
			user,
			session: expect.objectContaining({ id: "session" }),
			messages: [{ role: "user", content: request.content }],
			authorization: "Bearer token",
			messageId: "user-message",
		});
		expect(vocabulary.addWords).not.toHaveBeenCalled();
		expect(dialogue.recordWordEvent).not.toHaveBeenCalled();
		expect(result.addedWords).toEqual([]);
		expect(dialogue.saveCorrections).toHaveBeenCalledWith(
			expect.objectContaining({
				items: [
					expect.objectContaining({
						original: "eet суп",
						corrected: "soep eten",
						type: "grammar",
					}),
				],
			}),
		);
	});

	it("returns only tool-confirmed vocabulary and retains the actual tool history", async () => {
		const generated = await ai.generateTurn();
		const addedWords = [
			{
				item: { id: "v1" },
				word: { id: 9, word: "soep" },
				source: "native_insert",
				isNew: true,
			},
		];
		ai.generateTurn.mockResolvedValue({ ...generated, addedWords });
		const result = await service.sendMainMessage(request);
		expect(result.addedWords).toEqual(addedWords);
		expect(vocabulary.addWords).not.toHaveBeenCalled();
		expect(dialogue.appendMessage).toHaveBeenLastCalledWith(
			expect.objectContaining({
				metadata: expect.objectContaining({
					addedWords,
					modelMessages: generated.modelMessages,
					teacherNote: generated.data.teacherNote,
					correctedAnswer: "Ik wil soep eten.",
				}),
			}),
		);
	});

	it("does not turn a native-language question to the teacher into a correction", async () => {
		const generated = await ai.generateTurn();
		ai.generateTurn.mockResolvedValue({
			...generated,
			data: {
				...generated.data,
				teacherNote: "После wil используется инфинитив eten.",
				reply: "",
				translation: "",
				correctedAnswer: null,
				correctionExplanation: null,
				corrections: [],
			},
		});
		await service.sendMainMessage({
			...request,
			content: "Почему здесь eten, а не eet?",
		});
		expect(dialogue.saveCorrections).toHaveBeenCalledWith(
			expect.objectContaining({ items: [] }),
		);
		expect(vocabulary.addWords).not.toHaveBeenCalled();
	});

	it("highlights full-phrase grammar improvements without an extra model call", async () => {
		const generated = await ai.generateTurn();
		ai.generateTurn.mockReset().mockResolvedValue({
			...generated,
			data: {
				...generated.data,
				correctedAnswer: "Ik wil graag iets eten. Kan ik naar binnen?",
				corrections: [],
			},
		});
		await service.sendMainMessage({
			...request,
			content: "Ik wil eet a bit je. Kan ik binnen gaan?",
		});
		const saved = dialogue.saveCorrections.mock.calls[0][0] as {
			items: Array<{ original: string; corrected: string }>;
		};
		expect(saved.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					original: "eet a bit je",
					corrected: "graag iets eten",
				}),
			]),
		);
		expect(ai.generateTurn).toHaveBeenCalledTimes(1);
		expect(vocabulary.addWords).not.toHaveBeenCalled();
	});

	it("replays an existing response and its vocabulary results without running tools twice", async () => {
		const addedWords = [{ item: { id: "v1" }, word: { id: 9 } }];
		dialogue.findMessageByClientId.mockResolvedValue({ id: "existing-user" });
		dialogue.findAssistantResponse.mockResolvedValue({
			id: "existing-answer",
			metadata: { addedWords },
		});
		const result = await service.sendMainMessage(request);
		expect(ai.generateTurn).not.toHaveBeenCalled();
		expect(result.addedWords).toEqual(addedWords);
	});
});
