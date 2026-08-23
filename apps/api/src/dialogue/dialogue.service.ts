import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Repository } from "typeorm";
import { QueryFailedError } from "typeorm";
import {
	DIALOGUE_CORRECTION_REPOSITORY,
	DIALOGUE_MESSAGE_REPOSITORY,
	DIALOGUE_SESSION_REPOSITORY,
	DIALOGUE_THREAD_REPOSITORY,
	DIALOGUE_WORD_EVENT_REPOSITORY,
	LANGUAGE_SKILL_PROFILE_REPOSITORY,
	LLM_USAGE_REPOSITORY,
} from "~/constants/database.constants";
import type { UserEntity } from "~/user/user.entity";
import {
	DialogueCorrectionEntity,
	DialogueMessageEntity,
	DialogueSessionEntity,
	DialogueThreadEntity,
	DialogueWordEventEntity,
	LanguageSkillProfileEntity,
	LlmUsageEntity,
} from "./dialogue.entities";

export type DialogueCorrectionInput = {
	type: "typo" | "grammar" | "vocabulary";
	original: string;
	corrected: string;
	shortExplanation: string;
	affectedWords?: unknown[];
};

const DIALOGUE_MAX_TURNS = 12;

@Injectable()
export class DialogueService {
	constructor(
		@Inject(DIALOGUE_SESSION_REPOSITORY)
		private readonly sessions: Repository<DialogueSessionEntity>,
		@Inject(DIALOGUE_THREAD_REPOSITORY)
		private readonly threads: Repository<DialogueThreadEntity>,
		@Inject(DIALOGUE_MESSAGE_REPOSITORY)
		private readonly messages: Repository<DialogueMessageEntity>,
		@Inject(DIALOGUE_CORRECTION_REPOSITORY)
		private readonly corrections: Repository<DialogueCorrectionEntity>,
		@Inject(DIALOGUE_WORD_EVENT_REPOSITORY)
		private readonly wordEvents: Repository<DialogueWordEventEntity>,
		@Inject(LANGUAGE_SKILL_PROFILE_REPOSITORY)
		private readonly skillProfiles: Repository<LanguageSkillProfileEntity>,
		@Inject(LLM_USAGE_REPOSITORY)
		private readonly usage: Repository<LlmUsageEntity>,
	) {}

	async list(userId: number) {
		return this.sessions.find({
			where: { user: userId },
			order: { updated_at: "DESC" },
		});
	}

	async getActive(user: UserEntity) {
		const session = await this.sessions.findOneBy({
			user: user.id,
			language_learn: user.language_learn,
			language_speak: user.language_speak,
			status: "active",
		});
		return this.applyCurrentTurnLimit(session);
	}

	async createSession({
		user,
		title,
		description,
		customTopic,
	}: {
		user: UserEntity;
		title: string;
		description?: string;
		customTopic?: string;
	}) {
		const active = await this.getActive(user);
		if (active) {
			throw new ConflictException({
				message: "An active dialogue already exists",
				activeSessionId: active.id,
			});
		}

		const profile = await this.getOrCreateSkillProfile(user);
		try {
			return await this.sessions.manager.transaction(async (manager) => {
				const sessionRepository = manager.getRepository(DialogueSessionEntity);
				const threadRepository = manager.getRepository(DialogueThreadEntity);
				const session = await sessionRepository.save(
					sessionRepository.create({
						user: user.id,
						language_learn: user.language_learn,
						language_speak: user.language_speak,
						scenario_title: title,
						scenario_description: description,
						custom_topic: customTopic,
						difficulty_level: profile.level,
						target_turns: 8 + Math.floor(Math.random() * 5),
						max_turns: DIALOGUE_MAX_TURNS,
						metrics: {},
						status: "active",
						turn_count: 0,
					}),
				);
				const thread = await threadRepository.save(
					threadRepository.create({
						session_id: session.id,
						kind: "main",
						title,
					}),
				);
				return { session, thread };
			});
		} catch (error) {
			if (
				error instanceof QueryFailedError &&
				(error.driverError as { code?: string }).code === "23505"
			) {
				const current = await this.getActive(user);
				throw new ConflictException({
					message: "An active dialogue already exists",
					activeSessionId: current?.id,
				});
			}
			throw error;
		}
	}

	async getOwnedSession(id: string, userId: number) {
		let session = await this.sessions.findOneBy({ id });
		if (!session) throw new NotFoundException("Dialogue session not found");
		if (session.user !== userId) {
			throw new ForbiddenException("Dialogue belongs to another user");
		}
		session = await this.applyCurrentTurnLimit(session);
		return session;
	}

	private async applyCurrentTurnLimit(
		session: DialogueSessionEntity | null,
	): Promise<DialogueSessionEntity | null> {
		if (
			!session ||
			session.status !== "active" ||
			(session.max_turns === DIALOGUE_MAX_TURNS &&
				session.target_turns <= DIALOGUE_MAX_TURNS)
		) {
			return session;
		}
		session.max_turns = DIALOGUE_MAX_TURNS;
		session.target_turns = Math.min(session.target_turns, DIALOGUE_MAX_TURNS);
		return this.sessions.save(session);
	}

	async getDetail(id: string, userId: number) {
		const session = await this.getOwnedSession(id, userId);
		const threads = await this.threads.find({
			where: { session_id: id },
			order: { created_at: "ASC" },
		});
		const threadIds = threads.map((thread) => thread.id);
		const messages = threadIds.length
			? await this.messages
					.createQueryBuilder("message")
					.where("message.thread_id IN (:...threadIds)", { threadIds })
					.orderBy("message.thread_id", "ASC")
					.addOrderBy("message.sequence", "ASC")
					.getMany()
			: [];
		const corrections = await this.corrections.find({
			where: { session_id: id },
			order: { created_at: "ASC" },
		});
		return { session, threads, messages, corrections };
	}

	async getMainThread(sessionId: string) {
		const thread = await this.threads.findOneBy({
			session_id: sessionId,
			kind: "main",
		});
		if (!thread) throw new NotFoundException("Main dialogue thread not found");
		return thread;
	}

	async getOwnedThread(threadId: string, userId: number) {
		const thread = await this.threads.findOneBy({ id: threadId });
		if (!thread) throw new NotFoundException("Dialogue thread not found");
		await this.getOwnedSession(thread.session_id, userId);
		return thread;
	}

	async listMessages(threadId: string) {
		return this.messages.find({
			where: { thread_id: threadId },
			order: { sequence: "ASC" },
		});
	}

	async findMessageByClientId(threadId: string, clientMessageId: string) {
		return this.messages.findOneBy({
			thread_id: threadId,
			client_message_id: clientMessageId,
		});
	}

	async findAssistantResponse(threadId: string, userMessageId: string) {
		return this.messages
			.createQueryBuilder("message")
			.where("message.thread_id = :threadId", { threadId })
			.andWhere("message.role = 'assistant'")
			.andWhere("message.metadata ->> 'respondingTo' = :userMessageId", {
				userMessageId,
			})
			.getOne();
	}

	async listCorrections(sessionId: string) {
		return this.corrections.find({
			where: { session_id: sessionId },
			order: { created_at: "ASC" },
		});
	}

	async appendMessage({
		threadId,
		role,
		content,
		translation,
		metadata = {},
		clientMessageId,
		modelId,
	}: {
		threadId: string;
		role: "user" | "assistant" | "system";
		content: string;
		translation?: string;
		metadata?: Record<string, unknown>;
		clientMessageId?: string;
		modelId?: string;
	}) {
		if (clientMessageId) {
			const existing = await this.messages.findOneBy({
				thread_id: threadId,
				client_message_id: clientMessageId,
			});
			if (existing) return existing;
		}
		const result = await this.messages
			.createQueryBuilder("message")
			.select("COALESCE(MAX(message.sequence), -1) + 1", "next")
			.where("message.thread_id = :threadId", { threadId })
			.getRawOne<{ next: string }>();
		const next = result?.next ?? "0";
		return this.messages.save(
			this.messages.create({
				thread_id: threadId,
				client_message_id: clientMessageId,
				role,
				content,
				translation,
				sequence: Number(next),
				status: "complete",
				model_id: modelId,
				metadata,
			}),
		);
	}

	async saveCorrections({
		sessionId,
		userMessageId,
		assistantMessageId,
		items,
	}: {
		sessionId: string;
		userMessageId: string;
		assistantMessageId: string;
		items: DialogueCorrectionInput[];
	}) {
		if (items.length === 0) return [];
		return this.corrections.save(
			items.map((item) =>
				this.corrections.create({
					session_id: sessionId,
					message_id: userMessageId,
					assistant_message_id: assistantMessageId,
					type: item.type,
					original: item.original,
					corrected: item.corrected,
					short_explanation: item.shortExplanation,
					metadata: { affectedWords: item.affectedWords ?? [] },
				}),
			),
		);
	}

	async incrementTurn(sessionId: string, metrics: Record<string, number>) {
		const session = await this.sessions.findOneByOrFail({ id: sessionId });
		const previous = session.metrics as Record<string, number>;
		session.turn_count += 1;
		session.updated_at = new Date().toISOString();
		session.metrics = Object.fromEntries(
			[...new Set([...Object.keys(previous), ...Object.keys(metrics)])].map(
				(key) => [key, Number(previous[key] ?? 0) + Number(metrics[key] ?? 0)],
			),
		);
		return this.sessions.save(session);
	}

	async incrementMetric(sessionId: string, metric: string, amount = 1) {
		const session = await this.sessions.findOneByOrFail({ id: sessionId });
		const metrics = session.metrics as Record<string, number>;
		session.metrics = {
			...metrics,
			[metric]: Number(metrics[metric] ?? 0) + amount,
		};
		session.updated_at = new Date().toISOString();
		return this.sessions.save(session);
	}

	async complete(sessionId: string, summary: Record<string, unknown>) {
		const session = await this.sessions.findOneByOrFail({ id: sessionId });
		session.status = "completed";
		session.completed_at = new Date().toISOString();
		session.updated_at = session.completed_at;
		session.summary = summary;
		await this.updateSkillProfile(session);
		return this.sessions.save(session);
	}

	async getCorrection(id: string, userId: number) {
		const correction = await this.corrections.findOneBy({ id });
		if (!correction) throw new NotFoundException("Correction not found");
		await this.getOwnedSession(correction.session_id, userId);
		return correction;
	}

	async getOrCreateExplanationThread(
		correction: DialogueCorrectionEntity,
		title: string,
	) {
		const existing = await this.threads.findOneBy({
			correction_id: correction.id,
		});
		if (existing) return { thread: existing, created: false };
		const thread = await this.threads.save(
			this.threads.create({
				session_id: correction.session_id,
				kind: "explanation",
				correction_id: correction.id,
				title,
			}),
		);
		return { thread, created: true };
	}

	async recordWordEvent({
		sessionId,
		vocabularyId,
		messageId,
		source,
		isNew,
	}: {
		sessionId: string;
		vocabularyId: string;
		messageId?: string;
		source: "click" | "native_insert" | "correction" | "branch";
		isNew: boolean;
	}) {
		return this.wordEvents.save(
			this.wordEvents.create({
				session_id: sessionId,
				user_vocabulary_id: vocabularyId,
				message_id: messageId,
				source,
				is_new: isNew,
			}),
		);
	}

	async getWordEvents(sessionId: string) {
		return this.wordEvents.find({ where: { session_id: sessionId } });
	}

	async saveUsage(input: Omit<LlmUsageEntity, "id" | "created_at">) {
		return this.usage.save(this.usage.create(input));
	}

	async touchSession(sessionId: string) {
		await this.sessions.update(
			{ id: sessionId },
			{ updated_at: new Date().toISOString() },
		);
	}

	async deleteSession(id: string, userId: number) {
		await this.getOwnedSession(id, userId);
		const threads = await this.threads.find({ where: { session_id: id } });
		const threadIds = threads.map((thread) => thread.id);
		if (threadIds.length) {
			await this.messages
				.createQueryBuilder()
				.delete()
				.where("thread_id IN (:...threadIds)", { threadIds })
				.execute();
		}
		await Promise.all([
			this.corrections.delete({ session_id: id }),
			this.wordEvents.delete({ session_id: id }),
			this.usage.delete({ session_id: id }),
		]);
		await this.threads.delete({ session_id: id });
		await this.sessions.delete({ id, user: userId });
	}

	async deleteAll(userId: number) {
		const sessions = await this.list(userId);
		for (const session of sessions)
			await this.deleteSession(session.id, userId);
	}

	private async getOrCreateSkillProfile(user: UserEntity) {
		let profile = await this.skillProfiles.findOneBy({
			user: user.id,
			language_learn: user.language_learn,
			language_speak: user.language_speak,
		});
		if (!profile) {
			profile = await this.skillProfiles.save(
				this.skillProfiles.create({
					user: user.id,
					language_learn: user.language_learn,
					language_speak: user.language_speak,
					level: "A1",
					metrics: {},
				}),
			);
		}
		return profile;
	}

	private async updateSkillProfile(session: DialogueSessionEntity) {
		const profile = await this.skillProfiles.findOneBy({
			user: session.user,
			language_learn: session.language_learn,
			language_speak: session.language_speak,
		});
		if (!profile) return;
		const oldMetrics = profile.metrics as Record<string, number>;
		const sessionMetrics = session.metrics as Record<string, number>;
		profile.metrics = {
			...oldMetrics,
			sessions: Number(oldMetrics.sessions ?? 0) + 1,
			turns: Number(oldMetrics.turns ?? 0) + session.turn_count,
			corrections:
				Number(oldMetrics.corrections ?? 0) +
				Number(sessionMetrics.corrections ?? 0),
			hints: Number(oldMetrics.hints ?? 0) + Number(sessionMetrics.hints ?? 0),
			translations:
				Number(oldMetrics.translations ?? 0) +
				Number(sessionMetrics.translations ?? 0),
		};
		await this.skillProfiles.save(profile);
	}
}
