import { describe, expect, it, jest } from "@jest/globals";
import type { UserEntity } from "~/user/user.entity";
import { DialogueService } from "./dialogue.service";

describe("DialogueService turn limits", () => {
	it("clamps an existing active dialogue to twelve learner turns", async () => {
		const session = {
			id: "session",
			user: 7,
			language_learn: "nl",
			language_speak: "ru",
			status: "active",
			turn_count: 9,
			target_turns: 14,
			max_turns: 20,
		};
		const sessions = {
			findOneBy: jest.fn().mockResolvedValue(session),
			save: jest.fn().mockImplementation(async (value) => value),
		};
		const service = new DialogueService(
			sessions as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
			{} as never,
		);

		const result = await service.getActive({
			id: 7,
			language_learn: "nl",
			language_speak: "ru",
		} as UserEntity);

		expect(result).toEqual(
			expect.objectContaining({ target_turns: 12, max_turns: 12 }),
		);
		expect(sessions.save).toHaveBeenCalledWith(
			expect.objectContaining({ target_turns: 12, max_turns: 12 }),
		);
	});
});
