/** Manual smoke check: real OpenAI + HTTP MCP, isolated in-memory learner data.
 * Run from apps/api: node --env-file=.env -r ts-node/register/transpile-only
 * -r tsconfig-paths/register scripts/check-dialogue-teacher.ts
 */
import "reflect-metadata";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import express from "express";
import type {
	DialogueMessageEntity,
	DialogueSessionEntity,
} from "../src/dialogue/dialogue.entities";
import { DialogueAiService } from "../src/dialogue/dialogue-ai.service";
import { McpController } from "../src/mcp/mcp.controller";
import { McpToolsService } from "../src/mcp/mcp-tools.service";
import type { UserEntity } from "../src/user/user.entity";
import type { ResolvedVocabularyWord } from "../src/user-vocabulary/user-vocabulary.service";

async function main() {
	assert(process.env.OPENAI_API_KEY, "OPENAI_API_KEY is required");
	const user = {
		id: 1,
		language_learn: "nl",
		language_speak: "ru",
		name: "Test learner",
	} as UserEntity;
	const session = {
		id: randomUUID(),
		scenario_title: "В ресторане",
		scenario_description:
			"Ученик — посетитель без брони. Преподаватель — официант.",
		turn_count: 0,
		target_turns: 10,
		max_turns: 12,
	} as DialogueSessionEntity;
	const saved = new Map<
		string,
		{ word: ResolvedVocabularyWord; id: number; vocabularyId: string }
	>();
	const calls: Array<{ name: string; arguments: unknown }> = [];
	const vocabulary = {
		list: async () =>
			[...saved.values()].map(({ word, id, vocabularyId }) => ({
				id: vocabularyId,
				wordData: { ...word, id, language: "nl" },
				translation: { id, language: "ru", translation: word.translation },
			})),
		addWords: async ({ words }: { words: ResolvedVocabularyWord[] }) =>
			words.map((word) => {
				const existing = saved.get(word.word);
				const entry = existing ?? {
					word,
					id: saved.size + 1,
					vocabularyId: randomUUID(),
				};
				saved.set(word.word, entry);
				return {
					item: { id: entry.vocabularyId, word: entry.id },
					word: { id: entry.id, word: word.word },
					translation: {
						id: entry.id,
						translation: word.translation,
						language: "ru",
					},
					progress: {},
					source: word.source,
					isNew: !existing,
				};
			}),
	};
	const mcp = new McpToolsService(
		{
			findUserProgress: async () => ({
				total: 0,
				summary: {},
				items: [],
				byTopic: [],
				byCatalog: [],
			}),
		} as never,
		{
			findAll: async () => [],
			getWordsCountByTopicIds: async () => new Map(),
		} as never,
		vocabulary as never,
		{ findAll: async () => ({ items: [], total: 0 }) } as never,
		{ findAll: async () => [] } as never,
		{
			getSkillProfile: async () => ({ level: "A1", metrics: {} }),
			getOwnedSession: async () => ({
				...session,
				language_learn: "nl",
				language_speak: "ru",
			}),
			assertMessageInSession: async () => {},
			recordWordEvent: async () => {},
		} as never,
	);
	const controller = new McpController(mcp);
	const app = express();
	app.use(express.json());
	app.get("/mcp", (_req, res) => {
		void controller.methodNotAllowed(res);
	});
	app.post("/mcp", (req, res) => {
		if (req.body.method === "tools/call")
			calls.push({
				name: req.body.params.name,
				arguments: req.body.params.arguments,
			});
		void controller.handlePost(req, res, user);
	});
	const server = app.listen(0, "127.0.0.1");
	await new Promise<void>((resolve) => server.once("listening", resolve));
	const address = server.address();
	assert(address && typeof address !== "string");
	const ai = new DialogueAiService(
		new ConfigService({
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			OPENAI_CHAT_MODEL: "gpt-5.6-luna",
			CHAT_MCP_URL: `http://127.0.0.1:${address.port}/mcp`,
		}),
	);
	const messages: DialogueMessageEntity[] = [];
	const run = async (text?: string) => {
		const callStart = calls.length;
		const id = randomUUID();
		if (text)
			messages.push({
				id,
				role: "user",
				content: text,
				metadata: {},
			} as DialogueMessageEntity);
		const result = await ai.generateTurn({
			user,
			session,
			authorization: "Bearer test-fixture",
			messages,
			opening: !text,
			messageId: text ? id : undefined,
		});
		messages.push({
			id: randomUUID(),
			created_at: new Date().toISOString(),
			thread_id: session.id,
			sequence: messages.length,
			status: "complete",
			role: "assistant",
			content: result.data.reply,
			metadata: { modelMessages: result.modelMessages },
		});
		if (text) session.turn_count++;
		console.log(
			JSON.stringify(
				{
					user: text ?? "(opening)",
					calls: calls.slice(callStart),
					response: result.data,
					addedWords: result.addedWords.map((item) => item.word.word),
				},
				null,
				2,
			),
		);
		return result;
	};
	try {
		const opening = await run();
		assert(
			opening.data.teacherNote && opening.data.reply,
			"Opening must set up the lesson and start the scene",
		);
		const correction = await run("Nee. Ik wil eet суп. Kan ik binnen gaan?");
		assert(
			correction.data.correctedAnswer?.includes("soep"),
			"Corrected phrase must translate the native insertion",
		);
		assert(
			correction.data.correctedAnswer?.includes("eten"),
			"Corrected phrase must also fix grammar",
		);
		assert(
			saved.has("soep"),
			"Model should call MCP to save the target-language replacement",
		);
		assert(
			correction.addedWords.some((item) => item.word.word === "soep"),
			"App must receive the successful tool result",
		);
		const beforeQuestion = saved.size;
		const question = await run(
			"Почему здесь eten, а не eet? Объясни правило, пока не продолжай сцену.",
		);
		assert.equal(
			question.data.correctedAnswer,
			null,
			"A teacher question must not be corrected as an attempted Dutch answer",
		);
		assert.equal(
			saved.size,
			beforeQuestion,
			"A Russian teacher question must not be saved as vocabulary",
		);
		assert(question.data.teacherNote, "Teacher should answer the question");
		assert.equal(
			question.data.reply,
			"",
			"Teacher should respect a request to pause the scene",
		);
		assert.equal(
			question.data.shouldComplete,
			false,
			"A pause for explanation must not end the exercise",
		);
		const requested = await run(
			"Добавь, пожалуйста, слово menukaart в мой словарь.",
		);
		assert(
			saved.has("menukaart"),
			"Explicit save request must use the vocabulary tool",
		);
		assert(requested.addedWords.some((item) => item.word.word === "menukaart"));
		console.log(
			"PASS: role setup, whole-phrase correction, autonomous MCP write, teacher question, explicit save.",
		);
	} finally {
		server.closeAllConnections();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	}
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : "Smoke check failed");
	process.exitCode = 1;
});
