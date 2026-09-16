import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	jest,
} from "@jest/globals";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ForbiddenException } from "@nestjs/common";
import { McpToolsService } from "./mcp-tools.service";

describe("learner-controlled MCP vocabulary tools", () => {
	let client: Client;
	let server: McpServer;
	let vocabulary: { addWords: jest.Mock; list: jest.Mock };
	let dialogue: Record<string, jest.Mock>;
	const user = { id: 7, language_learn: "nl", language_speak: "ru" };
	const word = {
		word: "soep",
		translation: "суп",
		description: "Een warm gerecht in een kom.",
		transcription: "sup",
		source: "native_insert",
		resetWriting: true,
	};

	beforeEach(async () => {
		vocabulary = {
			addWords: jest.fn().mockResolvedValue([
				{
					item: { id: "v1" },
					word: { id: 9, word: "soep" },
					isNew: true,
					source: "native_insert",
				},
			]),
			list: jest.fn().mockResolvedValue([]),
		};
		dialogue = {
			getOwnedSession: jest.fn().mockResolvedValue({
				id: "session",
				language_learn: "nl",
				language_speak: "ru",
			}),
			assertMessageInSession: jest.fn().mockResolvedValue(undefined),
			recordWordEvent: jest.fn().mockResolvedValue(undefined),
		};
		const service = new McpToolsService(
			{} as never,
			{} as never,
			vocabulary as never,
			{} as never,
			{} as never,
			dialogue as never,
		);
		server = service.createServer({
			user: user as never,
			dialogueSessionId: "session",
			dialogueMessageId: "message",
		});
		client = new Client({ name: "test-teacher", version: "1" });
		const [clientTransport, serverTransport] =
			InMemoryTransport.createLinkedPair();
		await server.connect(serverTransport);
		await client.connect(clientTransport);
	});

	afterEach(async () => {
		await client.close();
		await server.close();
	});

	it("only describes tools on connect; no progress or vocabulary is fetched preemptively", async () => {
		const result = await client.listTools();
		expect(result.tools.map((tool) => tool.name)).toContain(
			"add_words_to_vocabulary",
		);
		expect(vocabulary.list).not.toHaveBeenCalled();
		expect(vocabulary.addWords).not.toHaveBeenCalled();
		expect(dialogue.getOwnedSession).not.toHaveBeenCalled();
	});

	it("executes an explicit write through the existing pipeline and records it for the summary", async () => {
		const result = await client.callTool({
			name: "add_words_to_vocabulary",
			arguments: { words: [word] },
		});
		expect(result.isError).not.toBe(true);
		expect(dialogue.getOwnedSession).toHaveBeenCalledWith("session", 7);
		expect(dialogue.assertMessageInSession).toHaveBeenCalledWith(
			"message",
			"session",
		);
		expect(vocabulary.addWords).toHaveBeenCalledWith({
			user,
			sessionId: "session",
			words: [word],
		});
		expect(dialogue.recordWordEvent).toHaveBeenCalledWith({
			sessionId: "session",
			messageId: "message",
			vocabularyId: "v1",
			source: "native_insert",
			isNew: true,
		});
		expect(result.structuredContent).toEqual({
			items: [expect.objectContaining({ isNew: true })],
		});
	});

	it("rejects writes attached to another learner's session before saving anything", async () => {
		dialogue.getOwnedSession.mockRejectedValue(
			new ForbiddenException("Dialogue belongs to another user"),
		);
		const result = await client.callTool({
			name: "add_words_to_vocabulary",
			arguments: { words: [word] },
		});
		expect(result.isError).toBe(true);
		expect(vocabulary.addWords).not.toHaveBeenCalled();
		expect(dialogue.recordWordEvent).not.toHaveBeenCalled();
	});

	it("rejects invalid word payloads at the tool boundary", async () => {
		const result = await client.callTool({
			name: "add_words_to_vocabulary",
			arguments: { words: [{ ...word, word: " " }] },
		});
		expect(result.isError).toBe(true);
		expect(vocabulary.addWords).not.toHaveBeenCalled();
	});
});
