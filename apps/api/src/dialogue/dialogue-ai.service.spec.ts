import { describe, expect, it } from "@jest/globals";
import { VOCABULARY_DESCRIPTION_RULES_PROMPT } from "~/prompts";
import { prepareDialogueStep } from "./dialogue-ai.service";

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
