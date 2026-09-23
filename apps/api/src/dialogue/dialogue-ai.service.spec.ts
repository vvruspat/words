import { describe, expect, it } from "@jest/globals";
import { VOCABULARY_DESCRIPTION_RULES_PROMPT } from "~/prompts";
import {
	dialogueAddedWords,
	dialogueModelMessages,
	prepareDialogueStep,
	resolveDialogueMaxOutputTokens,
	resolveDialogueModel,
	withoutDialogueReasoning,
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

	it("replays actual assistant and tool messages instead of flattening the transcript", () => {
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
		).toEqual([
			{
				role: "assistant",
				content: [history[0].content[1]],
			},
			history[1],
			history[2],
			{ role: "user", content: "Ja" },
		]);
	});

	it("drops reasoning-only messages from persisted model history", () => {
		expect(
			withoutDialogueReasoning([
				{
					role: "assistant",
					content: [{ type: "reasoning", text: "hidden" }],
				},
			] as never),
		).toEqual([]);
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
