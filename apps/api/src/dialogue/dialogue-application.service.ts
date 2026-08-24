import { ConflictException, Injectable } from "@nestjs/common";
import type { LanguageModelUsage } from "ai";
import type { UserEntity } from "~/user/user.entity";
import { UserVocabularyService } from "~/user-vocabulary/user-vocabulary.service";
import { DialogueService } from "./dialogue.service";
import {
	DialogueAiService,
	type DialogueTurn,
	type NativeInsertionResolution,
	type ResolvedWord,
} from "./dialogue-ai.service";
import {
	containsLanguageScript,
	detectNativeLanguageTerms,
} from "./dialogue-language.utils";

@Injectable()
export class DialogueApplicationService {
	constructor(
		private readonly dialogue: DialogueService,
		private readonly ai: DialogueAiService,
		private readonly vocabulary: UserVocabularyService,
	) {}

	async recommendations(user: UserEntity, authorization: string) {
		const result = await this.ai.recommendScenarios(user, authorization);
		await this.saveUsage(user.id, result);
		return result.data;
	}

	async start({
		user,
		authorization,
		title,
		description,
		customTopic,
	}: {
		user: UserEntity;
		authorization: string;
		title: string;
		description?: string;
		customTopic?: string;
	}) {
		if (customTopic) await this.ai.moderateCustomTopic(customTopic);
		const { session, thread } = await this.dialogue.createSession({
			user,
			title,
			description,
			customTopic,
		});

		try {
			const generated = await this.ai.generateOpening({
				user,
				session,
				authorization,
			});
			const turn = generated.data;
			const message = await this.dialogue.appendMessage({
				threadId: thread.id,
				role: "assistant",
				content: turn.reply,
				translation: turn.translation,
				modelId: generated.modelId,
				metadata: {
					hints: turn.hints,
					shouldWrapUp: false,
					shouldComplete: false,
				},
			});
			await this.saveUsage(user.id, generated, {
				sessionId: session.id,
				threadId: thread.id,
				messageId: message.id,
			});
			return { session, thread, message, corrections: [] };
		} catch (error) {
			await this.dialogue.deleteSession(session.id, user.id);
			throw error;
		}
	}

	async sendMainMessage({
		user,
		authorization,
		sessionId,
		content,
		clientMessageId,
	}: {
		user: UserEntity;
		authorization: string;
		sessionId: string;
		content: string;
		clientMessageId: string;
	}) {
		const session = await this.dialogue.getOwnedSession(sessionId, user.id);
		if (session.status !== "active") {
			throw new ConflictException("This dialogue is already complete");
		}
		const thread = await this.dialogue.getMainThread(sessionId);
		const existingUserMessage = await this.dialogue.findMessageByClientId(
			thread.id,
			clientMessageId,
		);
		if (existingUserMessage) {
			const existingAssistant = await this.dialogue.findAssistantResponse(
				thread.id,
				existingUserMessage.id,
			);
			if (existingAssistant) {
				return {
					session,
					userMessage: existingUserMessage,
					assistantMessage: existingAssistant,
					corrections: await this.dialogue.listCorrections(sessionId),
					addedWords: [],
				};
			}
		}

		const userMessage =
			existingUserMessage ??
			(await this.dialogue.appendMessage({
				threadId: thread.id,
				role: "user",
				content,
				clientMessageId,
			}));
		const history = await this.dialogue.listMessages(thread.id);
		const detectedNativeTerms = detectNativeLanguageTerms(
			content,
			user.language_speak,
			user.language_learn,
		);
		const [generated, correctionReview] = await Promise.all([
			this.ai.generateTurn({
				user,
				session,
				messages: history,
				authorization,
				detectedNativeTerms,
			}),
			this.ai.reviewLearnerAnswer({
				user,
				content,
				detectedNativeTerms,
				messages: history,
			}),
		]);
		let resolverResult: Awaited<
			ReturnType<DialogueAiService["resolveNativeInsertions"]>
		> | null = null;
		let turn = this.normalizeNativeInsertions({
			user,
			turn: {
				...generated.data,
				corrections: this.buildReviewedCorrections({
					content,
					correctedAnswer: correctionReview.data.correctedAnswer,
					overallExplanation: correctionReview.data.overallExplanation,
					detectedNativeTerms,
					evidence: [
						...correctionReview.data.corrections,
						...generated.data.corrections,
					],
				}),
			},
			detectedNativeTerms,
			resolutions: [],
		});
		const missingNativeTerms = detectedNativeTerms.filter(
			(term) => !this.findNativeWord(turn.nativeInsertions, term),
		);
		if (missingNativeTerms.length > 0) {
			resolverResult = await this.ai.resolveNativeInsertions({
				user,
				terms: missingNativeTerms,
				context: content,
			});
			turn = this.normalizeNativeInsertions({
				user,
				turn,
				detectedNativeTerms,
				resolutions: resolverResult.data.items,
			});
		}
		const assistantMessage = await this.dialogue.appendMessage({
			threadId: thread.id,
			role: "assistant",
			content: turn.reply,
			translation: turn.translation,
			modelId: generated.modelId,
			metadata: {
				hints: turn.hints,
				shouldWrapUp: turn.shouldWrapUp,
				shouldComplete: turn.shouldComplete,
				respondingTo: userMessage.id,
				correctedAnswer: correctionReview.data.correctedAnswer,
				correctionExplanation: correctionReview.data.overallExplanation,
			},
		});
		const corrections = await this.dialogue.saveCorrections({
			sessionId,
			userMessageId: userMessage.id,
			assistantMessageId: assistantMessage.id,
			items: turn.corrections,
		});
		const addedWords = await this.applyAutomaticVocabulary({
			user,
			sessionId,
			messageId: assistantMessage.id,
			turn,
			context: correctionReview.data.correctedAnswer,
		});
		const updatedSession = await this.dialogue.incrementTurn(sessionId, {
			corrections: corrections.length,
			nativeInsertions: turn.nativeInsertions.length,
		});
		await this.saveUsage(user.id, generated, {
			sessionId,
			threadId: thread.id,
			messageId: assistantMessage.id,
		});
		await this.saveUsage(user.id, correctionReview, {
			sessionId,
			threadId: thread.id,
			messageId: assistantMessage.id,
		});
		if (resolverResult) {
			await this.saveUsage(user.id, resolverResult, {
				sessionId,
				threadId: thread.id,
				messageId: assistantMessage.id,
			});
		}

		let finalSession = updatedSession;
		if (
			turn.shouldComplete ||
			updatedSession.turn_count >= updatedSession.max_turns
		) {
			finalSession = await this.finish(user, sessionId);
		}

		return {
			session: finalSession,
			userMessage,
			assistantMessage,
			corrections,
			addedWords,
		};
	}

	async openCorrectionBranch({
		user,
		correctionId,
	}: {
		user: UserEntity;
		correctionId: string;
	}) {
		const correction = await this.dialogue.getCorrection(correctionId, user.id);
		const { thread, created } =
			await this.dialogue.getOrCreateExplanationThread(
				correction,
				`Почему «${correction.corrected}»?`,
			);
		if (created) {
			const generated = await this.ai.explainCorrection({
				user,
				correction,
				messages: [],
			});
			const message = await this.dialogue.appendMessage({
				threadId: thread.id,
				role: "assistant",
				content: generated.data.reply,
				modelId: generated.modelId,
				metadata: { correctionId: correction.id },
			});
			await this.saveUsage(user.id, generated, {
				sessionId: correction.session_id,
				threadId: thread.id,
				messageId: message.id,
			});
		}
		await this.dialogue.touchSession(correction.session_id);
		return {
			thread,
			correction,
			messages: await this.dialogue.listMessages(thread.id),
		};
	}

	async sendExplanationMessage({
		user,
		threadId,
		content,
		clientMessageId,
	}: {
		user: UserEntity;
		threadId: string;
		content: string;
		clientMessageId: string;
	}) {
		const thread = await this.dialogue.getOwnedThread(threadId, user.id);
		if (thread.kind !== "explanation" || !thread.correction_id) {
			throw new ConflictException("This thread is not an explanation branch");
		}
		const correction = await this.dialogue.getCorrection(
			thread.correction_id,
			user.id,
		);
		const existing = await this.dialogue.findMessageByClientId(
			thread.id,
			clientMessageId,
		);
		const userMessage =
			existing ??
			(await this.dialogue.appendMessage({
				threadId: thread.id,
				role: "user",
				content,
				clientMessageId,
			}));
		if (existing) {
			const answer = await this.dialogue.findAssistantResponse(
				thread.id,
				existing.id,
			);
			if (answer) return { userMessage, assistantMessage: answer };
		}
		const history = await this.dialogue.listMessages(thread.id);
		const generated = await this.ai.explainCorrection({
			user,
			correction,
			messages: history,
		});
		const assistantMessage = await this.dialogue.appendMessage({
			threadId: thread.id,
			role: "assistant",
			content: generated.data.reply,
			modelId: generated.modelId,
			metadata: { respondingTo: userMessage.id },
		});
		await this.saveUsage(user.id, generated, {
			sessionId: correction.session_id,
			threadId: thread.id,
			messageId: assistantMessage.id,
		});
		await this.dialogue.touchSession(correction.session_id);
		return { userMessage, assistantMessage };
	}

	async addClickedWord({
		user,
		sessionId,
		messageId,
		word,
		context,
	}: {
		user: UserEntity;
		sessionId: string;
		messageId?: string;
		word: string;
		context: string;
	}) {
		await this.dialogue.getOwnedSession(sessionId, user.id);
		const generated = await this.ai.resolveWord({ user, word, context });
		const items = await this.vocabulary.addWords({
			user,
			sessionId,
			words: generated.data.items.map((item) => ({
				...item,
				source: "click",
			})),
		});
		for (const item of items) {
			await this.dialogue.recordWordEvent({
				sessionId,
				vocabularyId: item.item.id,
				messageId,
				source: "click",
				isNew: item.isNew,
			});
		}
		await this.saveUsage(user.id, generated, { sessionId, messageId });
		return items;
	}

	async finish(user: UserEntity, sessionId: string) {
		const session = await this.dialogue.getOwnedSession(sessionId, user.id);
		if (session.status === "completed") return session;
		const detail = await this.dialogue.getDetail(sessionId, user.id);
		const mainThread = detail.threads.find((thread) => thread.kind === "main");
		const mainMessages = mainThread
			? detail.messages.filter((message) => message.thread_id === mainThread.id)
			: [];
		const generated = await this.ai.summarize({
			user,
			session,
			messages: mainMessages,
			corrections: detail.corrections,
		});
		const events = await this.dialogue.getWordEvents(sessionId);
		const uniqueNewIds = [
			...new Set(
				events
					.filter((event) => event.is_new)
					.map((event) => event.user_vocabulary_id),
			),
		];
		const vocabularyItems = (
			await Promise.all(
				uniqueNewIds.map((id) => this.vocabulary.getById(user.id, id)),
			)
		).filter(Boolean);
		const summary = {
			...generated.data,
			newWordsCount: vocabularyItems.length,
			newWords: vocabularyItems.map((item) => ({
				id: item?.id,
				wordId: item?.word,
				word: item?.wordData.word,
				description: item?.wordData.meaning,
			})),
			correctedWords: detail.corrections.map((item) => ({
				original: item.original,
				corrected: item.corrected,
				type: item.type,
			})),
		};
		const completed = await this.dialogue.complete(sessionId, summary);
		await this.saveUsage(user.id, generated, { sessionId });
		return completed;
	}

	private async applyAutomaticVocabulary({
		user,
		sessionId,
		messageId,
		turn,
		context,
	}: {
		user: UserEntity;
		sessionId: string;
		messageId: string;
		turn: DialogueTurn;
		context: string;
	}) {
		const nativeWords = turn.nativeInsertions.map((word) => ({
			...word,
			source: "native_insert" as const,
			resetWriting: true,
		}));
		const nativeWordKeys = new Set(
			nativeWords.map((word) => this.lexicalKey(word.word)),
		);
		const correctionSurfaces = this.dedupeStrings(
			turn.corrections.flatMap((correction) =>
				this.correctedVocabularySurfaces(user, correction),
			),
		).filter((word) => !nativeWordKeys.has(this.lexicalKey(word)));
		const correctionWords = (
			await Promise.all(
				correctionSurfaces.map(async (surface) => {
					const generated = await this.ai.resolveWord({
						user,
						word: surface,
						context,
					});
					await this.saveUsage(user.id, generated, { sessionId, messageId });
					const resolved = generated.data.items
						.map((word) => this.normalizeNativeWord(user, word))
						.find(
							(word) => this.lexicalKey(word.word) === this.lexicalKey(surface),
						);
					return resolved
						? {
								...resolved,
								word: surface,
								source: "correction" as const,
								resetWriting: true,
							}
						: null;
				}),
			)
		).filter((word): word is NonNullable<typeof word> => word !== null);
		const items = await this.vocabulary.addWords({
			user,
			sessionId,
			words: this.dedupeResolvedWords([...nativeWords, ...correctionWords]),
		});
		for (const result of items) {
			await this.dialogue.recordWordEvent({
				sessionId,
				vocabularyId: result.item.id,
				messageId,
				source:
					result.source === "native_insert" ? "native_insert" : "correction",
				isNew: result.isNew,
			});
		}
		return items;
	}

	private correctedVocabularySurfaces(
		user: UserEntity,
		correction: DialogueTurn["corrections"][number],
	) {
		const modelWords = correction.affectedWords.map((word) =>
			this.normalizeNativeWord(user, word),
		);
		const wordsFromCorrectedText = modelWords.flatMap((word) => {
			const correctedSurface = this.findLexicalSurface(
				correction.corrected,
				word.word,
			);
			return correctedSurface ? [correctedSurface] : [];
		});
		if (wordsFromCorrectedText.length > 0) {
			return this.dedupeStrings(wordsFromCorrectedText);
		}

		const changedWords = this.changedCorrectedWords(
			correction.original,
			correction.corrected,
		);
		if (changedWords.length !== 1 || modelWords.length === 0) return [];

		return changedWords;
	}

	private findLexicalSurface(text: string, candidate: string) {
		const textTokens = this.positionedTokens(text).filter((token) =>
			/[\p{L}\p{N}]/u.test(token.value),
		);
		const candidateTokens = this.positionedTokens(candidate).filter((token) =>
			/[\p{L}\p{N}]/u.test(token.value),
		);
		if (candidateTokens.length === 0) return null;

		for (
			let start = 0;
			start <= textTokens.length - candidateTokens.length;
			start += 1
		) {
			const matches = candidateTokens.every(
				(token, offset) =>
					textTokens[start + offset].normalized === token.normalized,
			);
			if (!matches) continue;
			return text.slice(
				textTokens[start].start,
				textTokens[start + candidateTokens.length - 1].end,
			);
		}
		return null;
	}

	private changedCorrectedWords(original: string, corrected: string) {
		const originalTokens = this.positionedTokens(original).filter((token) =>
			/[\p{L}\p{N}]/u.test(token.value),
		);
		const correctedTokens = this.positionedTokens(corrected).filter((token) =>
			/[\p{L}\p{N}]/u.test(token.value),
		);
		const unchangedCorrectedIndexes = new Set(
			this.longestCommonTokenAnchors(originalTokens, correctedTokens)
				.filter(
					(anchor) =>
						anchor.original >= 0 && anchor.original < originalTokens.length,
				)
				.map((anchor) => anchor.corrected),
		);
		return correctedTokens
			.filter((_, index) => !unchangedCorrectedIndexes.has(index))
			.map((token) => token.value);
	}

	private normalizeNativeInsertions({
		user,
		turn,
		detectedNativeTerms,
		resolutions,
	}: {
		user: UserEntity;
		turn: DialogueTurn;
		detectedNativeTerms: string[];
		resolutions: NativeInsertionResolution[];
	}): DialogueTurn {
		const normalizedModelWords = turn.nativeInsertions.map((word) =>
			this.normalizeNativeWord(user, word),
		);
		const resolutionByTerm = new Map(
			resolutions.map((resolution) => [
				resolution.original.toLocaleLowerCase(),
				resolution,
			]),
		);
		const nativeInsertions = this.dedupeResolvedWords([
			...normalizedModelWords,
			...resolutions.map((resolution) =>
				this.normalizeNativeWord(user, {
					...resolution.target,
					translation: resolution.original,
				}),
			),
		]);
		const corrections = [...turn.corrections];
		for (const term of detectedNativeTerms) {
			const replacement = this.findNativeWord(nativeInsertions, term);
			if (!replacement) continue;
			const alreadyCorrected = corrections.some(
				(correction) =>
					correction.original.toLocaleLowerCase().includes(term) &&
					!correction.corrected.toLocaleLowerCase().includes(term),
			);
			if (alreadyCorrected) continue;
			const resolution = resolutionByTerm.get(term);
			corrections.push({
				type: "vocabulary",
				original: term,
				corrected: replacement.word,
				shortExplanation:
					resolution?.shortExplanation ?? `«${term}» → «${replacement.word}»`,
				affectedWords: [replacement],
			});
		}
		return { ...turn, nativeInsertions, corrections };
	}

	private mergeCorrections(
		content: string,
		candidates: DialogueTurn["corrections"],
	): DialogueTurn["corrections"] {
		const accepted: Array<{
			start: number;
			end: number;
			correction: DialogueTurn["corrections"][number];
		}> = [];
		const seen = new Set<string>();

		for (const candidate of candidates) {
			const original = candidate.original.trim();
			const corrected = candidate.corrected.trim();
			if (!original || !corrected || original === corrected) continue;
			const key = `${original}\u0000${corrected}`;
			if (seen.has(key)) continue;

			let searchFrom = 0;
			let start = -1;
			while (searchFrom <= content.length - original.length) {
				const match = content.indexOf(original, searchFrom);
				if (match < 0) break;
				const end = match + original.length;
				if (
					accepted.every((range) => end <= range.start || match >= range.end)
				) {
					start = match;
					break;
				}
				searchFrom = match + 1;
			}
			if (start < 0) continue;

			seen.add(key);
			accepted.push({
				start,
				end: start + original.length,
				correction: { ...candidate, original, corrected },
			});
		}

		return accepted
			.sort((left, right) => left.start - right.start)
			.map(({ correction }) => correction);
	}

	private buildReviewedCorrections({
		content,
		correctedAnswer,
		overallExplanation,
		detectedNativeTerms,
		evidence,
	}: {
		content: string;
		correctedAnswer: string;
		overallExplanation: string;
		detectedNativeTerms: string[];
		evidence: DialogueTurn["corrections"];
	}): DialogueTurn["corrections"] {
		const originalTokens = this.positionedTokens(content);
		const correctedTokens = this.positionedTokens(correctedAnswer);
		const anchors = this.longestCommonTokenAnchors(
			originalTokens,
			correctedTokens,
		);
		const derived: DialogueTurn["corrections"] = [];

		for (let index = 0; index < anchors.length - 1; index += 1) {
			const previous = anchors[index];
			const next = anchors[index + 1];
			let originalStart = previous.original + 1;
			let originalEnd = next.original;
			let correctedStart = previous.corrected + 1;
			let correctedEnd = next.corrected;
			if (originalStart === originalEnd && correctedStart === correctedEnd) {
				continue;
			}

			if (originalStart === originalEnd) {
				if (next.original < originalTokens.length) {
					originalEnd += 1;
					correctedEnd += 1;
				} else if (previous.original >= 0) {
					originalStart -= 1;
					correctedStart -= 1;
				}
			}
			if (correctedStart === correctedEnd) {
				if (next.corrected < correctedTokens.length) {
					originalEnd += 1;
					correctedEnd += 1;
				} else if (previous.corrected >= 0) {
					originalStart -= 1;
					correctedStart -= 1;
				}
			}

			const originalRange = this.tokenTextRange(
				content,
				originalTokens,
				originalStart,
				originalEnd,
			);
			const correctedRange = this.tokenTextRange(
				correctedAnswer,
				correctedTokens,
				correctedStart,
				correctedEnd,
			);
			if (!originalRange.text || !correctedRange.text) continue;
			if (
				!/[\p{L}\p{N}]/u.test(`${originalRange.text}${correctedRange.text}`)
			) {
				continue;
			}
			const originalLexical = this.positionedTokens(originalRange.text)
				.filter((token) => /[\p{L}\p{N}]/u.test(token.value))
				.map((token) => token.normalized)
				.join("\u0000");
			const correctedLexical = this.positionedTokens(correctedRange.text)
				.filter((token) => /[\p{L}\p{N}]/u.test(token.value))
				.map((token) => token.normalized)
				.join("\u0000");
			if (originalLexical === correctedLexical) continue;

			const supporting = evidence.filter((candidate) => {
				const start = content.indexOf(candidate.original);
				const end = start + candidate.original.length;
				return (
					start >= 0 && end > originalRange.start && start < originalRange.end
				);
			});
			const nativeInsertion = detectedNativeTerms.some((term) =>
				originalRange.text.toLocaleLowerCase().includes(term),
			);
			const types = new Set(supporting.map((item) => item.type));
			const type = nativeInsertion
				? "vocabulary"
				: types.has("grammar")
					? "grammar"
					: types.has("vocabulary")
						? "vocabulary"
						: types.has("typo")
							? "typo"
							: "grammar";
			const explanations = [
				...new Set(
					supporting
						.map((item) => item.shortExplanation.trim())
						.filter(Boolean),
				),
			];
			derived.push({
				type,
				original: originalRange.text,
				corrected: correctedRange.text,
				shortExplanation: explanations.join(" ") || overallExplanation,
				affectedWords: this.dedupeResolvedWords(
					supporting.flatMap((item) => item.affectedWords),
				),
			});
		}

		return this.mergeCorrections(content, [...derived, ...evidence]);
	}

	private positionedTokens(text: string) {
		return [
			...text.matchAll(/\p{L}+(?:[-'’]\p{L}+)*|\p{N}+|[^\p{L}\p{N}\s]+/gu),
		].map((match) => ({
			value: match[0],
			normalized: match[0].toLocaleLowerCase(),
			start: match.index,
			end: match.index + match[0].length,
		}));
	}

	private longestCommonTokenAnchors(
		original: ReturnType<DialogueApplicationService["positionedTokens"]>,
		corrected: ReturnType<DialogueApplicationService["positionedTokens"]>,
	) {
		const lengths = Array.from(
			{ length: original.length + 1 },
			() => new Uint16Array(corrected.length + 1),
		);
		for (let left = original.length - 1; left >= 0; left -= 1) {
			for (let right = corrected.length - 1; right >= 0; right -= 1) {
				lengths[left][right] =
					original[left].normalized === corrected[right].normalized
						? lengths[left + 1][right + 1] + 1
						: Math.max(lengths[left + 1][right], lengths[left][right + 1]);
			}
		}

		const anchors = [{ original: -1, corrected: -1 }];
		let left = 0;
		let right = 0;
		while (left < original.length && right < corrected.length) {
			if (original[left].normalized === corrected[right].normalized) {
				anchors.push({ original: left, corrected: right });
				left += 1;
				right += 1;
			} else if (lengths[left + 1][right] >= lengths[left][right + 1]) {
				left += 1;
			} else {
				right += 1;
			}
		}
		anchors.push({
			original: original.length,
			corrected: corrected.length,
		});
		return anchors;
	}

	private tokenTextRange(
		text: string,
		tokens: ReturnType<DialogueApplicationService["positionedTokens"]>,
		start: number,
		end: number,
	) {
		if (start < 0 || end <= start || start >= tokens.length) {
			return { text: "", start: 0, end: 0 };
		}
		const rangeStart = tokens[start].start;
		const rangeEnd = tokens[Math.min(end, tokens.length) - 1].end;
		return {
			text: text.slice(rangeStart, rangeEnd),
			start: rangeStart,
			end: rangeEnd,
		};
	}

	private normalizeNativeWord(user: UserEntity, word: ResolvedWord) {
		const reversed =
			containsLanguageScript(word.word, user.language_speak) &&
			containsLanguageScript(word.translation, user.language_learn);
		return reversed
			? { ...word, word: word.translation, translation: word.word }
			: word;
	}

	private findNativeWord(words: ResolvedWord[], nativeTerm: string) {
		return words.find((word) => {
			const translationTerms: string[] =
				word.translation
					.toLocaleLowerCase()
					.match(/\p{L}+(?:[-'’]\p{L}+)*/gu) ?? [];
			return translationTerms.includes(nativeTerm);
		});
	}

	private dedupeResolvedWords(words: ResolvedWord[]) {
		const seen = new Set<string>();
		return words.filter((word) => {
			const key = word.word.trim().toLocaleLowerCase();
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	private dedupeStrings(words: string[]) {
		const seen = new Set<string>();
		return words.filter((word) => {
			const key = this.lexicalKey(word);
			if (!key || seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	}

	private lexicalKey(word: string) {
		return this.positionedTokens(word)
			.filter((token) => /[\p{L}\p{N}]/u.test(token.value))
			.map((token) => token.normalized)
			.join("\u0000");
	}

	private async saveUsage(
		userId: number,
		result: { usage: unknown; modelId: string },
		context: {
			sessionId?: string;
			threadId?: string;
			messageId?: string;
		} = {},
	) {
		const usage = result.usage as LanguageModelUsage;
		await this.dialogue.saveUsage({
			user: userId,
			session_id: context.sessionId,
			thread_id: context.threadId,
			message_id: context.messageId,
			model: result.modelId || this.ai.model,
			input_tokens: usage.inputTokens ?? 0,
			cached_input_tokens: usage.inputTokenDetails?.cacheReadTokens ?? 0,
			output_tokens: usage.outputTokens ?? 0,
			total_tokens: usage.totalTokens ?? 0,
		});
	}
}
