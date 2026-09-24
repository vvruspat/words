import { describe, expect, it } from "@jest/globals";
import { VOCABULARY_DESCRIPTION_RULES_PROMPT } from "~/prompts";
import {
	dialogueAddedWords,
	dialogueModelMessages,
	dialogueResponseMessages,
	prepareDialogueStep,
	resolveDialogueMaxOutputTokens,
	resolveDialogueModel,
} from "./dialogue-ai.service";

describe("prepareDialogueStep", () => {
	it("leaves tool selection to the model with a final-answer safety limit", () => {
		expect(prepareDialogueStep({ stepNumber: 6 })).toEqual({});
		expect(prepareDialogueStep({ stepNumber: 7 })).toEqual({
			toolChoice: "none",
		});
	});

	it("keeps vocabulary hints in the target language and translations separate", () => {
		const rules = VOCABULARY_DESCRIPTION_RULES_PROMPT("nl", "ru");

		expect(rules).toContain(
			"description must be a short monolingual hint in Dutch",
		);
		expect(rules).toContain(
			"translation must be a direct translation in Russian",
		);
		expect(rules).toContain("description must never be written in Russian");
	});

	it("replays complete assistant and tool messages including required reasoning items", () => {
		const history = [
			{
				role: "assistant",
				content: [
					{
						type: "reasoning",
						text: "",
						providerOptions: {
							openai: { reasoningEncryptedContent: "old-reasoning" },
						},
					},
					{
						type: "tool-call",
						toolCallId: "c1",
						toolName: "get_user_vocabulary",
						input: {},
					},
				],
			},
			{
				role: "tool",
				content: [
					{
						type: "tool-result",
						toolCallId: "c1",
						toolName: "get_user_vocabulary",
						output: { type: "json", value: { items: [] } },
					},
				],
			},
			{ role: "assistant", content: "Teacher feedback" },
		];
		expect(
			dialogueModelMessages([
				{
					role: "assistant",
					content: "Scene line",
					metadata: { modelMessages: history },
				},
				{ role: "user", content: "Ja", metadata: {} },
			] as never),
		).toEqual([...history, { role: "user", content: "Ja" }]);
	});

	it("preserves encrypted reasoning required to continue a Responses conversation", () => {
		const messages = [
			{
				role: "assistant",
				content: [
					{
						type: "reasoning",
						text: "",
						providerOptions: {
							openai: {
								itemId: "rs_1",
								reasoningEncryptedContent: "encrypted",
							},
						},
					},
				],
			},
		] as never;
		expect(dialogueResponseMessages(messages)).toEqual(messages);
	});

	it("flattens legacy GPT-6 history whose required reasoning item was removed", () => {
		expect(
			dialogueModelMessages([
				{
					role: "assistant",
					content: "Voor hoeveel personen?",
					metadata: {
						teacherNote: "Продолжаем сцену.",
						modelMessages: [
							{
								role: "assistant",
								content: [
									{
										type: "text",
										text: '{"reply":"Voor hoeveel personen?"}',
										providerOptions: {
											openai: { itemId: "msg_1" },
										},
									},
								],
							},
						],
					},
				},
			] as never),
		).toEqual([
			{
				role: "assistant",
				content: "Продолжаем сцену.\nVoor hoeveel personen?",
			},
		]);
	});

	it("only reports successfully executed vocabulary writes", () => {
		const word = {
			item: { id: "v1" },
			word: { id: 9, word: "soep" },
			isNew: true,
		};
		expect(
			dialogueAddedWords([
				{
					toolName: "get_user_vocabulary",
					output: { structuredContent: { items: [word] } },
				},
				{
					toolName: "add_words_to_vocabulary",
					output: {
						isError: true,
						content: [{ type: "text", text: "failed" }],
					},
				},
			]),
		).toEqual([]);
		expect(
			dialogueAddedWords([
				{
					toolName: "add_words_to_vocabulary",
					output: { structuredContent: { items: [word] } },
				},
				{
					toolName: "add_words_to_vocabulary",
					output: {
						content: [
							{ type: "text", text: JSON.stringify({ items: [word] }) },
						],
					},
				},
			]),
		).toEqual([word]);
	});
});

describe("resolveDialogueMaxOutputTokens", () => {
	it("uses a concise dialogue limit by default", () => {
		expect(resolveDialogueMaxOutputTokens()).toBe(2_500);
	});

	it("allows a positive integer override", () => {
		expect(resolveDialogueMaxOutputTokens("24000")).toBe(24_000);
	});

	it.each([
		"",
		"0",
		"-1",
		"invalid",
		"1.5",
	])("falls back for an invalid override (%s)", (value) => {
		expect(resolveDialogueMaxOutputTokens(value)).toBe(2_500);
	});
});

describe("resolveDialogueModel", () => {
	it("uses GPT-6 Luna by default", () => {
		expect(resolveDialogueModel()).toBe("gpt-6-luna");
	});

	it("preserves an explicit model override", () => {
		expect(resolveDialogueModel("gpt-5.6-terra")).toBe("gpt-5.6-terra");
	});
});
