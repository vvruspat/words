import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { WordEntity } from "~/word/word.entity";

@Entity({ name: "user_vocabulary" })
@Index("idx_user_vocabulary_user_word", ["user", "word"], { unique: true })
export class UserVocabularyEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "int" })
	user: number;

	@Column({ type: "int" })
	word: number;

	@ManyToOne(() => WordEntity, { onDelete: "CASCADE" })
	@JoinColumn({ name: "word" })
	wordData: WordEntity;

	@Column({
		type: "enum",
		enum: ["click", "native_insert", "correction", "manual"],
		default: "manual",
	})
	source: "click" | "native_insert" | "correction" | "manual";

	@Column({ type: "uuid", nullable: true })
	source_session_id?: string | null;
}
