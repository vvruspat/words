import type {
	Report,
	ReportStatus,
	ReportType,
	Word,
} from "@vvruspat/words-types";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { WordEntity } from "../word/word.entity";

@Entity({ name: "report" })
export class ReportEntity implements Report {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "int" })
	word: number;

	@ManyToOne(() => WordEntity, { nullable: true, onDelete: "CASCADE" })
	@JoinColumn({ name: "word" })
	wordData?: Word;

	@Column({
		type: "enum",
		enum: ["word", "translation", "audio"],
	})
	type: ReportType;

	@Column({ type: "text", nullable: true })
	description?: string;

	@Column({
		type: "enum",
		enum: ["new", "reviewed", "resolved"],
		default: "new",
	})
	status: ReportStatus;
}
