import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BadRequestException, Injectable } from "@nestjs/common";
import type { Language, Word } from "@vvruspat/words-types";
import { DialogueService } from "~/dialogue/dialogue.service";
import { LearningService } from "~/learning/learning.service";
import { TopicService } from "~/topic/topic.service";
import type { UserEntity } from "~/user/user.entity";
import { UserVocabularyService } from "~/user-vocabulary/user-vocabulary.service";
import { WordService } from "~/word/word.service";
import { WordTranslationService } from "~/wordstranslation/wordstranslation.service";
import { MCP_TOOL_SCHEMAS } from "./mcp-tool.schemas";

type WordFilters = {
	language?: string;
	topicId?: number;
	catalogId?: number;
	search?: string;
	translation?: string;
	status?: Word["status"];
	limit?: number;
	offset?: number;
	includeTranslations?: boolean;
};

export type McpRequestContext = {
	user: UserEntity;
	dialogueSessionId?: string;
	dialogueMessageId?: string;
};

@Injectable()
export class McpToolsService {
	constructor(
		private readonly learningService: LearningService,
		private readonly topicService: TopicService,
		private readonly userVocabularyService: UserVocabularyService,
		private readonly wordService: WordService,
		private readonly wordTranslationService: WordTranslationService,
		private readonly dialogueService: DialogueService,
	) {}

	createServer(context: McpRequestContext): McpServer {
		const server = new McpServer({ name: "words-api-mcp", version: "1.0.0" });
		this.registerTopicTools(server, context);
		this.registerWordTools(server, context);
		this.registerProgressTools(server, context);
		this.registerVocabularyTools(server, context);
		return server;
	}

	private registerTopicTools(
		server: McpServer,
		context: McpRequestContext,
	): void {
		server.registerTool(
			"list_topics",
			{
				title: "List relevant topics",
				description:
					"List curriculum and private topics visible to the authenticated learner.",
				inputSchema: MCP_TOOL_SCHEMAS.list_topics.inputSchema,
				annotations: { readOnlyHint: true },
			},
			async ({ language, limit, offset }) => {
				const topics = await this.topicService.findAll(
					{ language: language ?? context.user.language_learn, limit, offset },
					context.user.id,
				);
				const counts = await this.topicService.getWordsCountByTopicIds(
					topics.map((topic) => topic.id),
					language ?? context.user.language_learn,
				);
				return this.ok({
					items: topics.map((topic) => ({
						...topic,
						wordsCount: counts.get(topic.id) ?? 0,
					})),
				});
			},
		);
	}

	private registerWordTools(
		server: McpServer,
		context: McpRequestContext,
	): void {
		server.registerTool(
			"list_words",
			{
				title: "List visible words",
				description:
					"Search curriculum and private words visible to the authenticated learner.",
				inputSchema: MCP_TOOL_SCHEMAS.list_words.inputSchema,
				annotations: { readOnlyHint: true },
			},
			async (filters) => this.listWords(filters, context),
		);
	}

	private registerProgressTools(
		server: McpServer,
		context: McpRequestContext,
	): void {
		server.registerTool(
			"get_user_progress",
			{
				title: "Get learner progress",
				description:
					"Return the authenticated learner's progress and aggregate skill signals.",
				inputSchema: MCP_TOOL_SCHEMAS.get_user_progress.inputSchema,
				annotations: { readOnlyHint: true },
			},
			async ({ language, limit, offset }) => {
				const progress = await this.learningService.findUserProgress({
					userId: context.user.id,
					language: language ?? context.user.language_learn,
					limit,
					offset,
				});
				return this.ok({
					user: {
						name: context.user.name,
						language_speak: context.user.language_speak,
						language_learn: context.user.language_learn,
					},
					profile: await this.dialogueService.getSkillProfile(context.user),
					total: progress.total,
					limit: progress.limit,
					offset: progress.offset,
					summary: progress.summary,
					byTopic: progress.byTopic,
					byCatalog: progress.byCatalog,
					items: progress.items.map(
						({ wordData, translationData, ...item }) => ({
							...item,
							wordData: this.compactWord(wordData),
							translationData: translationData
								? {
										id: translationData.id,
										translation: translationData.translation,
										language: translationData.language,
									}
								: null,
						}),
					),
				});
			},
		);

		server.registerTool(
			"get_user_vocabulary",
			{
				title: "Get learner vocabulary",
				description:
					"Return words collected by the authenticated learner. Saved does not mean mastered; use get_user_progress for knowledge and training scores.",
				inputSchema: MCP_TOOL_SCHEMAS.get_user_vocabulary.inputSchema,
				annotations: { readOnlyHint: true },
			},
			async ({ language, limit, offset }) => {
				const vocabulary = await this.userVocabularyService.list(
					context.user,
					language ?? context.user.language_learn,
				);
				return this.ok({
					total: vocabulary.length,
					limit,
					offset,
					items: vocabulary
						.slice(offset, offset + limit)
						.map(({ wordData, translation, ...item }) => ({
							...item,
							wordData: this.compactWord(wordData),
							translation: translation
								? {
										id: translation.id,
										translation: translation.translation,
										language: translation.language,
									}
								: null,
						})),
				});
			},
		);
	}

	private registerVocabularyTools(
		server: McpServer,
		context: McpRequestContext,
	) {
		server.registerTool(
			"add_words_to_vocabulary",
			{
				title: "Add words to the learner's personal vocabulary",
				description:
					"Save useful words for this authenticated learner's training when they ask to save a word or reveal a vocabulary gap. Provide valid target-language forms and native-language translations. Existing words are reused. This can reset writing practice when requested; it never edits global curriculum words. Saving is an explicit tool action, not a side effect of correcting an answer.",
				inputSchema: MCP_TOOL_SCHEMAS.add_words_to_vocabulary.inputSchema,
				annotations: { readOnlyHint: false, destructiveHint: false },
			},
			async ({ words }) => {
				if (context.dialogueSessionId) {
					const session = await this.dialogueService.getOwnedSession(
						context.dialogueSessionId,
						context.user.id,
					);
					if (
						session.language_learn !== context.user.language_learn ||
						session.language_speak !== context.user.language_speak
					) {
						throw new BadRequestException("Dialogue language pair has changed");
					}
					if (context.dialogueMessageId) {
						await this.dialogueService.assertMessageInSession(
							context.dialogueMessageId,
							session.id,
						);
					}
				}
				const items = await this.userVocabularyService.addWords({
					user: context.user,
					sessionId: context.dialogueSessionId,
					words,
				});
				if (context.dialogueSessionId) {
					for (const result of items) {
						await this.dialogueService.recordWordEvent({
							sessionId: context.dialogueSessionId,
							messageId: context.dialogueMessageId,
							vocabularyId: result.item.id,
							source: result.source === "manual" ? "click" : result.source,
							isNew: result.isNew,
						});
					}
				}
				return this.ok({ items });
			},
		);
	}

	private async listWords(
		filters: WordFilters,
		context: McpRequestContext,
	): Promise<CallToolResult> {
		const {
			language = context.user.language_learn,
			topicId,
			catalogId,
			search,
			translation,
			status,
			limit = 12,
			offset = 0,
			includeTranslations = true,
		} = filters;
		const response = await this.wordService.findAll(
			{
				language: language as Language,
				topic: topicId,
				catalog: catalogId,
				word: search,
				translation,
				status,
				limit,
				offset,
			},
			context.user.id,
		);
		const translations = includeTranslations
			? await this.wordTranslationService.findAll({
					words: response.items.map((word) => word.id),
					language: context.user.language_speak,
				})
			: [];
		const byWord = new Map<number, unknown[]>();
		for (const item of translations) {
			const values = byWord.get(item.word) ?? [];
			values.push(item);
			byWord.set(item.word, values);
		}
		return this.ok({
			items: response.items.map((word) => ({
				...this.compactWord(word),
				translations: (byWord.get(word.id) ?? []).map((item) => {
					const translation = item as {
						id: number;
						translation: string;
						language: string;
					};
					return {
						id: translation.id,
						translation: translation.translation,
						language: translation.language,
					};
				}),
			})),
			total: response.total,
			limit,
			offset,
		});
	}

	private compactWord(word: Word) {
		return {
			id: word.id,
			word: word.word,
			language: word.language,
			topic: word.topic,
			catalog: word.catalog,
			meaning: word.meaning,
			transcription: word.transcription,
			status: word.status,
		};
	}

	private ok(data: Record<string, unknown>): CallToolResult {
		return {
			structuredContent: data,
			content: [{ type: "text", text: JSON.stringify(data) }],
		};
	}
}
