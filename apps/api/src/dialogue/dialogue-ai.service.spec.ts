import { describe, expect, it } from "@jest/globals";
import {
	DIALOGUE_RECOMMENDATIONS_PROMPT,
	DIALOGUE_TURN_PROMPT,
	VOCABULARY_DESCRIPTION_RULES_PROMPT,
} from "~/prompts";
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

	it("keeps the teacher in the counterpart role and requires a faithful translation", () => {
		const user = {
			language_learn: "nl",
			language_speak: "ru",
		} as never;
		const recommendations = DIALOGUE_RECOMMENDATIONS_PROMPT(user);
		const turn = DIALOGUE_TURN_PROMPT({
			user,
			session: {
				scenario_title: "Заказ кофе в кафе",
				scenario_description: "Ученик — клиент, преподаватель — бариста.",
				difficulty_level: "A1",
				turn_count: 0,
				target_turns: 8,
				max_turns: 12,
			} as never,
			messages: [],
			opening: true,
			detectedNativeTerms: [],
		});

		expect(recommendations).toContain("explicitly assign both roles");
		expect(recommendations).toContain("learner is the customer");
		expect(turn).toContain("you speak only for the counterpart teacher role");
		expect(turn).toContain(
			"compare reply and translation once sentence by sentence",
		);
		expect(turn).toContain("focusWords must contain only 0-4");
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
