import { createMCPClient, type MCPClient } from "@ai-sdk/mcp";
import { openai } from "@ai-sdk/openai";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { generateText, Output, stepCountIs, type ToolSet } from "ai";
import OpenAI from "openai";
import * as z from "zod/v4";
import {
	CORRECTION_EXPLANATION_PROMPT,
	DIALOGUE_RECOMMENDATIONS_PROMPT,
	DIALOGUE_SUMMARY_PROMPT,
	DIALOGUE_TEACHER_SYSTEM_PROMPT,
	DIALOGUE_TURN_PROMPT,
	NATIVE_INSERTION_RESOLUTION_PROMPT,
	WORD_RESOLUTION_PROMPT,
} from "~/prompts";
import type { UserEntity } from "~/user/user.entity";
import type {
	DialogueCorrectionEntity,
	DialogueMessageEntity,
	DialogueSessionEntity,
} from "./dialogue.entities";

const MCP_SCHEMAS = {
	list_topics: {
		inputSchema: z.object({
			language: z.string().optional(),
			limit: z.number().int().min(1).max(20).default(12),
			offset: z.number().int().min(0).default(0),
		}),
	},
	list_words: {
		inputSchema: z.object({
			language: z.string().optional(),
			topicId: z.number().int().positive().optional(),
			catalogId: z.number().int().positive().optional(),
			search: z.string().optional(),
			translation: z.string().optional(),
			status: z.enum(["processing", "processed"]).optional(),
			limit: z.number().int().min(1).max(25).default(12),
			offset: z.number().int().min(0).default(0),
			includeTranslations: z.boolean().default(true),
		}),
	},
	get_user_progress: {
		inputSchema: z.object({
			language: z.string().optional(),
			limit: z.number().int().min(1).max(25).default(12),
			offset: z.number().int().min(0).default(0),
		}),
	},
	get_user_vocabulary: {
		inputSchema: z.object({
			language: z.string().optional(),
			limit: z.number().int().min(1).max(50).default(20),
			offset: z.number().int().min(0).default(0),
		}),
	},
};

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
	affectedWords: z.array(resolvedWordSchema).max(4),
});

const turnSchema = z.object({
	reply: z.string().min(1),
	translation: z.string().min(1),
	correctedAnswer: z
		.string()
		.min(1)
		.nullable()
		.describe(
			"The learner's complete answer rewritten as grammatically correct, natural target-language speech. Null only for the opening turn.",
		),
	correctionExplanation: z
		.string()
		.min(1)
		.max(500)
		.nullable()
		.describe(
			"A concise native-language explanation of the full correction. Null only for the opening turn.",
		),
	corrections: z.array(correctionSchema).max(8),
	nativeInsertions: z.array(resolvedWordSchema).max(4),
	hints: z.array(z.string()).max(3),
	shouldWrapUp: z.boolean(),
	shouldComplete: z.boolean(),
});

const nativeInsertionResolutionSchema = z.object({
	items: z.array(
		z.object({
			original: z.string().min(1).max(100),
			target: resolvedWordSchema,
			shortExplanation: z.string().min(1).max(500),
		}),
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
export type NativeInsertionResolution = z.infer<
	typeof nativeInsertionResolutionSchema
>["items"][number];

const OPENAI_PROVIDER_OPTIONS = {
	openai: { reasoningEffort: "medium" as const },
};

export const prepareDialogueStep = ({ stepNumber }: { stepNumber: number }) =>
	stepNumber >= 3 ? ({ toolChoice: "none" } as const) : {};

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
			const result = await generateText({
				model: openai(this.model),
				providerOptions: OPENAI_PROVIDER_OPTIONS,
				tools,
				stopWhen: stepCountIs(8),
				prepareStep: prepareDialogueStep,
				output: Output.object({ schema: recommendationSchema }),
				system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
				prompt: DIALOGUE_RECOMMENDATIONS_PROMPT(user),
				maxOutputTokens: 3000,
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
		detectedNativeTerms = [],
	}: {
		user: UserEntity;
		session: DialogueSessionEntity;
		messages: DialogueMessageEntity[];
		authorization: string;
		opening?: boolean;
		detectedNativeTerms?: string[];
	}) {
		return this.withMcp(authorization, async (tools) => {
			const result = await generateText({
				model: openai(this.model),
				providerOptions: OPENAI_PROVIDER_OPTIONS,
				tools,
				stopWhen: stepCountIs(8),
				prepareStep: prepareDialogueStep,
				output: Output.object({ schema: turnSchema }),
				system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
				prompt: DIALOGUE_TURN_PROMPT({
					user,
					session,
					messages,
					opening,
					detectedNativeTerms,
				}),
				maxOutputTokens: 3500,
			});
			return this.result(result);
		});
	}

	async resolveNativeInsertions({
		user,
		terms,
		context,
	}: {
		user: UserEntity;
		terms: string[];
		context: string;
	}) {
		const result = await generateText({
			model: openai(this.model),
			providerOptions: OPENAI_PROVIDER_OPTIONS,
			output: Output.object({ schema: nativeInsertionResolutionSchema }),
			system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
			prompt: NATIVE_INSERTION_RESOLUTION_PROMPT({ user, terms, context }),
			maxOutputTokens: 2000,
		});
		return this.result(result);
	}

	async explainCorrection({
		user,
		correction,
		messages,
	}: {
		user: UserEntity;
		correction: DialogueCorrectionEntity;
		messages: DialogueMessageEntity[];
	}) {
		const schema = z.object({ reply: z.string().min(1) });
		const result = await generateText({
			model: openai(this.model),
			providerOptions: OPENAI_PROVIDER_OPTIONS,
			output: Output.object({ schema }),
			system: DIALOGUE_TEACHER_SYSTEM_PROMPT(user),
			prompt: CORRECTION_EXPLANATION_PROMPT({ user, correction, messages }),
			maxOutputTokens: 1800,
		});
		return this.result(result);
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
			maxOutputTokens: 1800,
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
			maxOutputTokens: 1800,
		});
		return this.result(result);
	}

	get model() {
		return this.config.get<string>("OPENAI_CHAT_MODEL") || "gpt-5-nano";
	}

	private async withMcp<T>(
		authorization: string,
		callback: (tools: ToolSet) => Promise<T>,
	): Promise<T> {
		let client: MCPClient | null = null;
		try {
			client = await createMCPClient({
				transport: {
					type: "http",
					url: this.mcpUrl,
					headers: { Authorization: authorization },
					redirect: "error",
				},
				name: "paranoun-dialogue-api",
				version: "1.0.0",
				onUncaughtError: (error) =>
					this.logger.error("Dialogue MCP error", error),
			});
			const tools: ToolSet = await client.tools({ schemas: MCP_SCHEMAS });
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
		output: TOutput | undefined;
		totalUsage: unknown;
		response: { modelId: string };
	}) {
		if (!result.output)
			throw new Error("The language model returned no output");
		return {
			data: result.output,
			usage: result.totalUsage,
			modelId: result.response.modelId,
		};
	}
}
