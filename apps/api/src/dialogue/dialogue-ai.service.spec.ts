import { describe, expect, it } from "@jest/globals";
import { VOCABULARY_DESCRIPTION_RULES_PROMPT } from "~/prompts";
import {
	prepareDialogueStep,
	resolveDialogueMaxOutputTokens,
} from "./dialogue-ai.service";

describe("prepareDialogueStep", () => {
	it("forces a final answer after three MCP rounds", () => {
		expect(prepareDialogueStep({ stepNumber: 2 })).toEqual({});
		expect(prepareDialogueStep({ stepNumber: 3 })).toEqual({
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
});

describe("resolveDialogueMaxOutputTokens", () => {
	it("uses the shared chat limit by default", () => {
		expect(resolveDialogueMaxOutputTokens()).toBe(15_000);
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
		expect(resolveDialogueMaxOutputTokens(value)).toBe(15_000);
	});
});
