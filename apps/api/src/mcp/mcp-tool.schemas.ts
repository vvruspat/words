import * as z from "zod/v4";

// One contract for the MCP server and both OpenAI clients.
export const MCP_TOOL_SCHEMAS = {
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
			search: z.string().trim().optional(),
			translation: z.string().trim().optional(),
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
	add_words_to_vocabulary: {
		inputSchema: z.object({
			words: z
				.array(
					z.object({
						word: z
							.string()
							.trim()
							.min(1)
							.max(100)
							.describe(
								"Valid target-language word or expression. For a correction, use the corrected form, never the learner's typo or native-language placeholder.",
							),
						translation: z
							.string()
							.trim()
							.min(1)
							.max(300)
							.describe(
								"Direct translation into the learner's native language.",
							),
						description: z
							.string()
							.trim()
							.min(1)
							.max(180)
							.describe(
								"Simple monolingual hint in the language of the word, not a translation. Mention the grammatical form if relevant.",
							),
						transcription: z
							.string()
							.max(100)
							.describe("IPA transcription, or an empty string if unsure."),
						source: z
							.enum(["native_insert", "correction", "manual"])
							.describe(
								"Why save it: native-language placeholder, a corrected vocabulary/spelling gap, or an explicit learner request.",
							),
						resetWriting: z
							.boolean()
							.describe(
								"Reset writing practice only when this word revealed a spelling or vocabulary gap.",
							),
					}),
				)
				.min(1)
				.max(6),
		}),
	},
};
