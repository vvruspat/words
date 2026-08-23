import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

export type DialogueSessionStatus = "active" | "completed";
export type DialogueThreadKind = "main" | "explanation";
export type DialogueMessageRole = "user" | "assistant" | "system";

@Entity({ name: "dialogue_session" })
@Index(
	"idx_dialogue_one_active_language_pair",
	["user", "language_learn", "language_speak"],
	{ unique: true, where: "status = 'active'" },
)
export class DialogueSessionEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP",
	})
	updated_at: string;

	@Column({ type: "timestamptz", nullable: true })
	completed_at?: string | null;

	@Column({ type: "int" })
	user: number;

	@Column({ type: "varchar" })
	language_learn: string;

	@Column({ type: "varchar" })
	language_speak: string;

	@Column({ type: "varchar" })
	scenario_title: string;

	@Column({ type: "text", nullable: true })
	scenario_description?: string | null;

	@Column({ type: "text", nullable: true })
	custom_topic?: string | null;

	@Column({ type: "varchar", default: "A1" })
	difficulty_level: string;

	@Column({ type: "enum", enum: ["active", "completed"], default: "active" })
	status: DialogueSessionStatus;

	@Column({ type: "int", default: 0 })
	turn_count: number;

	@Column({ type: "int", default: 10 })
	target_turns: number;

	@Column({ type: "int", default: 12 })
	max_turns: number;

	@Column({ type: "jsonb", default: () => "'{}'::jsonb" })
	metrics: Record<string, unknown>;

	@Column({ type: "jsonb", nullable: true })
	summary?: Record<string, unknown> | null;
}

@Entity({ name: "dialogue_thread" })
@Index("idx_dialogue_thread_correction", ["correction_id"], {
	unique: true,
	where: "correction_id IS NOT NULL",
})
export class DialogueThreadEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "uuid" })
	session_id: string;

	@Column({ type: "enum", enum: ["main", "explanation"] })
	kind: DialogueThreadKind;

	@Column({ type: "uuid", nullable: true })
	correction_id?: string | null;

	@Column({ type: "varchar" })
	title: string;
}

@Entity({ name: "dialogue_message" })
@Index("idx_dialogue_message_thread_sequence", ["thread_id", "sequence"], {
	unique: true,
})
@Index("idx_dialogue_message_client_id", ["thread_id", "client_message_id"], {
	unique: true,
	where: "client_message_id IS NOT NULL",
})
export class DialogueMessageEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "uuid" })
	thread_id: string;

	@Column({ type: "varchar", nullable: true })
	client_message_id?: string | null;

	@Column({ type: "enum", enum: ["user", "assistant", "system"] })
	role: DialogueMessageRole;

	@Column({ type: "text" })
	content: string;

	@Column({ type: "text", nullable: true })
	translation?: string | null;

	@Column({ type: "int" })
	sequence: number;

	@Column({
		type: "enum",
		enum: ["pending", "complete", "error"],
		default: "complete",
	})
	status: "pending" | "complete" | "error";

	@Column({ type: "varchar", nullable: true })
	model_id?: string | null;

	@Column({ type: "jsonb", default: () => "'{}'::jsonb" })
	metadata: Record<string, unknown>;
}

@Entity({ name: "dialogue_correction" })
export class DialogueCorrectionEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "uuid" })
	session_id: string;

	@Column({ type: "uuid" })
	message_id: string;

	@Column({ type: "uuid" })
	assistant_message_id: string;

	@Column({ type: "enum", enum: ["typo", "grammar", "vocabulary"] })
	type: "typo" | "grammar" | "vocabulary";

	@Column({ type: "text" })
	original: string;

	@Column({ type: "text" })
	corrected: string;

	@Column({ type: "text" })
	short_explanation: string;

	@Column({ type: "jsonb", default: () => "'{}'::jsonb" })
	metadata: Record<string, unknown>;
}

@Entity({ name: "dialogue_word_event" })
export class DialogueWordEventEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "uuid" })
	session_id: string;

	@Column({ type: "uuid" })
	user_vocabulary_id: string;

	@Column({ type: "uuid", nullable: true })
	message_id?: string | null;

	@Column({
		type: "enum",
		enum: ["click", "native_insert", "correction", "branch"],
	})
	source: "click" | "native_insert" | "correction" | "branch";

	@Column({ type: "boolean", default: false })
	is_new: boolean;
}

@Entity({ name: "language_skill_profile" })
@Index(
	"idx_language_skill_profile_pair",
	["user", "language_learn", "language_speak"],
	{
		unique: true,
	},
)
export class LanguageSkillProfileEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "int" })
	user: number;

	@Column({ type: "varchar" })
	language_learn: string;

	@Column({ type: "varchar" })
	language_speak: string;

	@Column({ type: "varchar", default: "A1" })
	level: string;

	@Column({ type: "jsonb", default: () => "'{}'::jsonb" })
	metrics: Record<string, unknown>;

	@Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP",
		onUpdate: "CURRENT_TIMESTAMP",
	})
	updated_at: string;
}

@Entity({ name: "llm_usage" })
export class LlmUsageEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "int" })
	user: number;

	@Column({ type: "uuid", nullable: true })
	session_id?: string | null;

	@Column({ type: "uuid", nullable: true })
	thread_id?: string | null;

	@Column({ type: "uuid", nullable: true })
	message_id?: string | null;

	@Column({ type: "varchar" })
	model: string;

	@Column({ type: "int", default: 0 })
	input_tokens: number;

	@Column({ type: "int", default: 0 })
	cached_input_tokens: number;

	@Column({ type: "int", default: 0 })
	output_tokens: number;

	@Column({ type: "int", default: 0 })
	total_tokens: number;
}
