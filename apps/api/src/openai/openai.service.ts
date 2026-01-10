import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import { AVAILABLE_LANGUAGES, type Language } from "@repo/types";
import type { Queue } from "bullmq";
import type { Request, Response } from "express";
import OpenAI, { type APIPromise } from "openai";
import {
	AUDIO_CREATION_DONE,
	TRANSLATION_DONE,
	WORDS_GENERATION_DONE,
} from "~/constants/queue-events.constants";
import { TRANSLATIONS_QUEUE, WORDS_QUEUE } from "~/constants/queues.constants";
import { codeToLanguage } from "~/utils/codeToLanguage";
import type { WordEntity } from "~/word/word.entity";
import {
	GENERATE_WORDS_FOR_LEVEL_PROMPT_ID,
	GENERATE_WORDS_FOR_TOPIC_PROMPT_ID,
	GENERATE_WORDS_PROMPT_ID,
	TRANSLATE_WORDS_PROMPT_ID,
} from "./constants/prompts";
import { chooseVoice } from "./utlis/chooseVoice";

const WORDS_LIMIT = 100;

@Injectable()
export class OpenAIService {
	private openai = new OpenAI({
		apiKey: process.env.OPENAI_API_KEY,
	});

	private readonly logger = new Logger(OpenAIService.name);
	private readonly webhookClient = new OpenAI({
		webhookSecret: process.env.OPENAI_WEBHOOK_SECRET,
	});

	constructor(
		@InjectQueue(WORDS_QUEUE) private wordsQueue: Queue,
		@InjectQueue(TRANSLATIONS_QUEUE) private translationsQueue: Queue,
	) {}

	async handleWebhook(
		req: Request,
		res: Response,
		headers: Record<string, string>,
	) {
		try {
			const event = await this.webhookClient.webhooks.unwrap(req.body, headers);

			if (event.type === "response.completed") {
				const response_id = event.data.id;
				const response =
					await this.webhookClient.responses.retrieve(response_id);
				const output_text = response.output
					.filter((item) => item.type === "message")
					.flatMap((item) => item.content)
					.filter((contentItem) => contentItem.type === "output_text")
					.map((contentItem) => contentItem.text)
					.join("");

				this.logger.log(`Response output: ${output_text}`);
			}
			res.status(200).send();
		} catch (error) {
			if (error instanceof OpenAI.InvalidWebhookSignatureError) {
				this.logger.error("Invalid signature", error);
				res.status(400).send("Invalid signature");
			} else {
				this.logger.error("Webhook error", error);
				res.status(500).send("Internal server error");
			}
		}
	}

	async generateWordsWithoutTopic(
		language: string,
		except: string[],
	): Promise<APIPromise<OpenAI.Responses.Response>> {
		return await this.openai.responses.create({
			prompt: {
				id: GENERATE_WORDS_PROMPT_ID,
				version: "11",
				variables: {
					limit: WORDS_LIMIT.toString(),
					wordlanguage: language,
					exclude: except.join(","),
				},
			},
			input: [
				{
					role: "user",
					content: "Return the result as JSON.",
				},
			],
			text: {
				format: {
					type: "json_object",
				},
			},
		});
	}

	async generateWordsForTopic(
		language: string,
		except: string[],
		topic: string,
	): Promise<APIPromise<OpenAI.Responses.Response>> {
		return await this.openai.responses.create({
			prompt: {
				id: GENERATE_WORDS_FOR_TOPIC_PROMPT_ID,
				version: "4",
				variables: {
					limit: WORDS_LIMIT.toString(),
					wordlanguage: language,
					topic,
					exclude: except.join(","),
				},
			},
			input: [
				{
					role: "user",
					content: "Return the result as JSON.",
				},
			],
			text: {
				format: {
					type: "json_object",
				},
			},
		});
	}

	async generateWordsForLevel(
		language: string,
		except: string[],
		topic: string,
		level: string,
	): Promise<APIPromise<OpenAI.Responses.Response>> {
		return await this.openai.responses.create({
			prompt: {
				id: GENERATE_WORDS_FOR_LEVEL_PROMPT_ID,
				version: "3",
				variables: {
					limit: WORDS_LIMIT.toString(),
					wordlanguage: language,
					topic,
					level,
					exclude: except.join(","),
				},
			},
			input: [
				{
					role: "user",
					content: "Return the result as JSON.",
				},
			],
			text: {
				format: {
					type: "json_object",
				},
			},
		});
	}

	async generateWords(
		language: string,
		except: string[],
		topic?: string,
		level?: string,
	): Promise<void> {
		this.logger.log(
			`Generating words in ${language}, except: ${except.join(", ")}`,
		);

		let response: OpenAI.Responses.Response;

		if (topic && level) {
			response = await this.generateWordsForLevel(
				language,
				except,
				topic,
				level,
			);
		} else if (topic) {
			response = await this.generateWordsForTopic(language, except, topic);
		} else {
			response = await this.generateWordsWithoutTopic(language, except);
		}

		this.logger.log("Generate words response: ", response.output_text);

		try {
			const newWords = JSON.parse(response.output_text);

			this.wordsQueue.add(WORDS_GENERATION_DONE, {
				words:
					newWords.result ||
					newWords.results ||
					newWords.data ||
					newWords.items ||
					newWords,
			});

			this.logger.log(`Generated words: ${JSON.stringify(newWords)}`);
		} catch (error) {
			this.logger.error("Error parsing generated words", error);
		}
	}

	async translateWords(language: string, words: WordEntity[]) {
		const response = await this.openai.responses.create({
			prompt: {
				id: TRANSLATE_WORDS_PROMPT_ID,
				version: "1",
				variables: {
					from_language: language,
					languages: Object.keys(AVAILABLE_LANGUAGES)
						.filter((lang) => lang !== language)
						.join(","),
					words: words.map((word) => word.word).join(","),
				},
			},
			input: [
				{
					role: "user",
					content: "Return the result as JSON.",
				},
			],
			text: {
				format: {
					type: "json_object",
				},
			},
		});

		this.logger.log("Translation response: ", response.output_text);

		const translatedWords = JSON.parse(response.output_text);

		this.translationsQueue.add(TRANSLATION_DONE, {
			generatedTranslations:
				translatedWords.translations ??
				translatedWords.result ??
				translatedWords.results ??
				translatedWords.data ??
				translatedWords.items ??
				translatedWords,
			words,
		});
	}

	async makeAudio(language: Language, word: string, wordId: WordEntity["id"]) {
		const mp3 = await this.openai.audio.speech.create({
			model: "gpt-4o-mini-tts",
			voice: chooseVoice(language),
			input: word,
			instructions: `Generate clear pronunciation of the word in ${codeToLanguage(language)}. Speak as a teacher.`,
		});

		const buffer = Buffer.from(await mp3.arrayBuffer());

		this.wordsQueue.add(AUDIO_CREATION_DONE, {
			filename: `word_${language}_${word}.mp3`,
			audio: buffer.toString("base64"),
			wordId,
		});
	}
}
