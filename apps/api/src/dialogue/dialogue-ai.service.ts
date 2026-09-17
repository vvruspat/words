import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	generateText,
	type ModelMessage,
	NoOutputGeneratedError,
	Output,
	stepCountIs,
	type ToolSet,
} from "ai";
import OpenAI from "openai";
import * as z from "zod/v4";
import { MCP_TOOL_SCHEMAS } from "~/mcp/mcp-tool.schemas";
import {
	CORRECTION_EXPLANATION_PROMPT,
	DIALOGUE_OPENING_REQUEST_PROMPT,
	DIALOGUE_RECOMMENDATIONS_PROMPT,
	DIALOGUE_RECOMMENDATIONS_SYSTEM_PROMPT,
	DIALOGUE_SUMMARY_PROMPT,
	DIALOGUE_TEACHER_SYSTEM_PROMPT,
	DIALOGUE_TURN_PROMPT,
	WORD_RESOLUTION_PROMPT,
} from "~/prompts";
import type { UserEntity } from "~/user/user.entity";
import type { UserVocabularyService } from "~/user-vocabulary/user-vocabulary.service";
import type {
	DialogueCorrectionEntity,
	DialogueMessageEntity,
	DialogueSessionEntity,
} from "./dialogue.entities";

const resolvedWordSchema = z.object({
	word: z
		.string()
		.min(1)
		.max(100)
		.describe("A valid word or expression in the language being learned."),
	translation: z
		.string()
		.min(1)
		.max(300)
		.describe("A direct translation in the learner's native language."),
	description: z
		.string()
		.min(1)
		.max(180)
		.describe(
			"A short monolingual hint in the same language as the word, never a translation.",
		),
	transcription: z.string().max(100),
});

const correctionSchema = z.object({
	type: z.enum(["typo", "grammar", "vocabulary"]),
	original: z.string(),
	corrected: z.string(),
	shortExplanation: z.string(),
});

const turnSchema = z.object({
	teacherNote: z
		.string()
		.max(1500)
		.describe(
			"A short message addressed directly to the learner in their native language. I = teacher, you = learner. Set up roles, answer their question or give feedback. Never an internal note or instructions to another teacher. May be empty.",
		),
	reply: z
		.string()
		.describe(
			"The next scene line in the language being learned, from the teacher's assigned role. Empty when pausing to explain something.",
		),
	translation: z
		.string()
		.describe(
			"A faithful, natural translation of reply in the learner's native language, preserving speaker, person, intent, and questions.",
		),
	focusWords: z
		.array(z.string().trim().min(1).max(100))
		.max(4)
		.describe(
			"Up to four useful target-language words or short expressions that occur verbatim in reply and are likely new to this learner.",
		),
	correctedAnswer: z
		.string()
		.min(1)
		.nullable()
		.describe(
			"The learner's complete answer rewritten as grammatically correct, natural target-language speech. Null for the opening, a natural answer or a question addressed to the teacher.",
		),
	correctionExplanation: z
		.string()
		.min(1)
		.max(500)
		.nullable()
		.describe(
			"A concise native-language explanation of the full correction, or null if there is no correction.",
		),
	corrections: z.array(correctionSchema).max(8),
	hints: z.array(z.string()).max(3),
	shouldWrapUp: z
		.boolean()
		.describe(
			"True only when beginning the scene's conclusion. False when pausing for a teacher question or vocabulary action.",
		),
	shouldComplete: z
		.boolean()
		.describe(
			"True only for an explicit request to finish the exercise, a natural end to the scene, or the hard turn limit. Pausing to explain a rule or save a word is NOT completion.",
		),
});

const recommendationSchema = z.object({
	scenarios: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
				openingLine: z.string(),
				estimatedMinutes: z.number().int().min(3).max(15),
			}),
		)
		.min(3)
		.max(5),
});

const summarySchema = z.object({
	strengths: z.array(z.string()).min(1).max(4),
	improvements: z.array(z.string()).min(1).max(4),
	encouragement: z.string(),
});

export type DialogueTurn = z.infer<typeof turnSchema>;
export type ResolvedWord = z.infer<typeof resolvedWordSchema>;

const OPENAI_PROVIDER_OPTIONS = {
	openai: { reasoningEffort: "medium" as const, parallelToolCalls: false },
};

const RECOMMENDATION_PROVIDER_OPTIONS = {
	openai: { reasoningEffort: "low" as const, parallelToolCalls: false },
};

const DEFAULT_MAX_OUTPUT_TOKENS = 15_000;

export const resolveDialogueMaxOutputTokens = (configured?: string) => {
	const parsed = Number(configured);
	return Number.isInteger(parsed) && parsed > 0
		? parsed
		: DEFAULT_MAX_OUTPUT_TOKENS;
};

export const prepareDialogueStep = ({ stepNumber }: { stepNumber: number }) =>
	stepNumber >= 7 ? ({ toolChoice: "none" } as const) : {};

export const dialogueModelMessages = (
	messages: DialogueMessageEntity[],
): ModelMessage[] =>
	messages.flatMap((message): ModelMessage[] => {
		// Replay the actual conversation, including calls the model chose itself.
		// This avoids re-fetching vocabulary and preserves teacher explanations.
		if (
			message.role === "assistant" &&
			Array.isArray(message.metadata?.modelMessages)
		) {
			return message.metadata.modelMessages as ModelMessage[];
		}
		return [{ role: message.role, content: message.content }];
	});

type VocabularyResult = Awaited<
	ReturnType<UserVocabularyService["addWords"]>
>[number];

export const dialogueAddedWords = (
	results: Array<{ toolName: string; output: unknown }>,
): VocabularyResult[] => {
	const words = new Map<string, VocabularyResult>();
	for (const result of results) {
		if (result.toolName !== "add_words_to_vocabulary") continue;
		const output = result.output as {
			isError?: boolean;
			structuredContent?: { items?: VocabularyResult[] };
			content?: Array<{ type: string; text?: string }>;
		};
		if (!output || output.isError) continue;
		const data =
			output.structuredContent ??
			(() => {
				const text = output.content?.find((part) => part.type === "text")?.text;
				if (!text) return null;
				try {
					return JSON.parse(text) as { items?: VocabularyResult[] };
				} catch {
					return null;
				}
			})();
		for (const item of data?.items ?? []) {
			if (item.item?.id && item.word?.id) {
				const previous = words.get(item.item.id);
				words.set(item.item.id, {
					...item,
					isNew: item.isNew || previous?.isNew || false,
				});
			}
		}
	}
	return [...words.values()];
};

@Injectable()
export class DialogueAiService {
	private readonly logger = new Logger(DialogueAiService.name);
	private readonly moderationClient: OpenAI;

	constructor(private readonly config: ConfigService) {
		this.moderationClient = new OpenAI({
			apiKey: this.config.get<string>("OPENAI_API_KEY"),
		});
	}

	async moderateCustomTopic(topic: string): Promise<void> {
		const result = await this.moderationClient.moderations.create({
			model: "omni-moderation-latest",
			input: topic,
		});
		if (result.results.some((item) => item.flagged)) {
			throw new BadRequestException(
				"This topic cannot be used for an all-ages learning dialogue",
			);
		}
	}

	async recommendScenarios(user: UserEntity, authorization: string) {
		return this.withMcp(authorization, async (tools) => {
			const readTools = Object.fromEntries(
				Object.entries(tools).filter(
					([name]) => name !== "add_words_to_vocabulary",
				),
			) as ToolSet;
			const result = await generateText({
				model: openai(this.model),
				providerOptions: RECOMMENDATION_PROVIDER_OPTIONS,
				tools: readTools,
				stopWhen: stepCountIs(5),
				prepareStep: ({ stepNumber }) =>
					stepNumber >= 4 ? { toolChoice: "none" as const } : {},
				toolChoice: "auto",
				output: Output.object({ schema: recommendationSchema }),
				system: DIALOGUE_RECOMMENDATIONS_SYSTEM_PROMPT(user),
				prompt: DIALOGUE_RECOMMENDATIONS_PROMPT(user),
				maxOutputTokens: Math.min(this.maxOutputTokens, 5_000),
			});
			return this.result(result);
		});
	}

	async generateOpening({
		user,
		session,
		authorization,
	}: {
		user: UserEntity;
		session: DialogueSessionEntity;
		authorization: string;
	}) {
		return this.generateTurn({
			user,
			session,
			messages: [],
			authorization,
			opening: true,
		});
	}

	async generateTurn({
		user,
		session,
		messages,
		authorization,
		opening = false,
		messageId,
	}: {
		user: UserEntity;
		session: DialogueSessionEntity;
		messages: DialogueMessageEntity[];
		authorization: string;
		opening?: boolean;
		messageId?: string;
	}) {
		return this.withMcp(
			authorization,
			async (tools) => {
				const result = await generateText({
					model: openai(this.model),
					providerOptions: OPENAI_PROVIDER_OPTIONS,
					tools,
					toolChoice: "auto",
					stopWhen: stepCountIs(8),
					prepareStep: prepareDialogueStep,
					output: Output.object({ schema: turnSchema }),
					system:
						DIALOGUE_TEACHER_SYSTEM_PROMPT(user) +
						"\n\n" +
						DIALOGUE_TURN_PROMPT({ user, session, opening }),
					messages: messages.length
						? dialogueModelMessages(messages)
						: [{ role: "user", content: DIALOGUE_OPENING_REQUEST_PROMPT }],
					maxOutputTokens: this.maxOutputTokens,
				});
				return {
					...this.result(result),
					modelMessages: result.response.messages,
					addedWords: dialogueAddedWords(
						result.steps.flatMap((step) => step.toolResults),
					),
				};
			},
			{ sessionId: session.id, messageId },
		);
	}

	async explainCorrection({
		user,
		correction,
		messages,
		authorization,
		messageId,
	}: {
		user: UserEntity;
		correction: DialogueCorrectionEntity;
		messages: DialogueMessageEntity[];
		authorization: string;
		messageId?: string;
	}) {
		return this.withMcp(
			authorization,
			async (tools) => {
				const result = await generateText({
					model: openai(this.model),
					providerOptions: OPENAI_PROVIDER_OPTIONS,
					tools,
					toolChoice: "auto",
					stopWhen: stepCountIs(8),
					prepareStep: prepareDialogueStep,
					output: Output.object({
						schema: z.object({ reply: z.string().min(1) }),
					}),
					system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
					messages: [
						{
							role: "user",
							content: CORRECTION_EXPLANATION_PROMPT({ user, correction }),
						},
						...dialogueModelMessages(messages),
					],
					maxOutputTokens: this.maxOutputTokens,
				});
				return {
					...this.result(result),
					modelMessages: result.response.messages,
					addedWords: dialogueAddedWords(
						result.steps.flatMap((step) => step.toolResults),
					),
				};
			},
			{ sessionId: correction.session_id, messageId },
		);
	}

	async resolveWord({
		user,
		word,
		context,
	}: {
		user: UserEntity;
		word: string;
		context: string;
	}) {
		const schema = z.object({
			items: z.array(resolvedWordSchema).min(1).max(2),
		});
		const result = await generateText({
			model: openai(this.model),
			providerOptions: OPENAI_PROVIDER_OPTIONS,
			output: Output.object({ schema }),
			system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
			prompt: WORD_RESOLUTION_PROMPT({ user, word, context }),
			maxOutputTokens: this.maxOutputTokens,
		});
		return this.result(result);
	}

	async summarize({
		user,
		session,
		messages,
		corrections,
	}: {
		user: UserEntity;
		session: DialogueSessionEntity;
		messages: DialogueMessageEntity[];
		corrections: DialogueCorrectionEntity[];
	}) {
		const result = await generateText({
			model: openai(this.model),
			providerOptions: OPENAI_PROVIDER_OPTIONS,
			output: Output.object({ schema: summarySchema }),
			system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
			prompt: DIALOGUE_SUMMARY_PROMPT({
				user,
				session,
				messages,
				corrections,
			}),
			maxOutputTokens: this.maxOutputTokens,
		});
		return this.result(result);
	}

	get model() {
		return this.config.get<string>("OPENAI_CHAT_MODEL") || "gpt-5-nano";
	}

	private get maxOutputTokens() {
		return resolveDialogueMaxOutputTokens(
			this.config.get<string>("OPENAI_CHAT_MAX_OUTPUT_TOKENS"),
		);
	}

	private async withMcp<T>(
		authorization: string,
		callback: (tools: ToolSet) => Promise<T>,
		context: { sessionId?: string; messageId?: string } = {},
	): Promise<T> {
		let client: MCPClient | null = null;
		try {
			client = await createMCPClient({
				transport: {
					type: "http",
					url: this.mcpUrl,
					headers: {
						Authorization: authorization,
						...(context.sessionId
							? { "X-Dialogue-Session-Id": context.sessionId }
							: {}),
						...(context.messageId
							? { "X-Dialogue-Message-Id": context.messageId }
							: {}),
					},
					redirect: "error",
				},
				name: "paranoun-dialogue-api",
				version: "1.0.0",
				onUncaughtError: (error) =>
					this.logger.error("Dialogue MCP error", error),
			});
			const tools: ToolSet = await client.tools({ schemas: MCP_TOOL_SCHEMAS });
			return await callback(tools);
		} finally {
			await client?.close();
		}
	}

	private get mcpUrl() {
		return (
			this.config.get<string>("CHAT_MCP_URL") ||
			`http://127.0.0.1:${this.config.get<string>("PORT") || "3000"}/mcp`
		);
	}

	private result<TOutput>(result: {
		output: TOutput;
		finishReason: string;
		rawFinishReason?: string;
		totalUsage: unknown;
		response: { modelId: string };
	}) {
		let output: TOutput;
		try {
			output = result.output;
		} catch (error) {
			if (NoOutputGeneratedError.isInstance(error)) {
				this.logger.error(
					`Dialogue model returned no structured output: ${JSON.stringify({
						modelId: result.response.modelId,
						finishReason: result.finishReason,
						rawFinishReason: result.rawFinishReason,
						usage: result.totalUsage,
					})}`,
				);
			}
			throw error;
		}

		return {
			data: output,
			usage: result.totalUsage,
			modelId: result.response.modelId,
		};
	}
}
