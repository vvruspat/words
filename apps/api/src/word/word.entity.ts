import type {
	Language,
	Topic,
	VocabCatalog,
	Word,
} from "@vvruspat/words-types";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { TopicEntity } from "../topic/topic.entity";
import { VocabCatalogEntity } from "../vocabcatalog/vocabcatalog.entity";

@Entity({ name: "word" })
export class WordEntity implements Word {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP",
		nullable: true,
	})
	created_at: string;

	@Column({ type: "int" })
	topic: number;

	@ManyToOne(() => TopicEntity, { nullable: true })
	@JoinColumn({ name: "topic" })
	topicData?: Topic;

	@Column({ type: "int" })
	catalog: number;

	@ManyToOne(() => VocabCatalogEntity, { nullable: true })
	@JoinColumn({ name: "catalog" })
	catalogData?: VocabCatalog;

	@Column()
	word: string;

	@Column({ type: "varchar" })
	language: Language;

	@Column({ nullable: true })
	audio: string;

	@Column()
	transcribtion: string;

	@Column({ type: "float", default: 0 })
	score: number;

	@Column({
		type: "enum",
		enum: ["processing", "processed"],
		default: "processing",
	})
	status: "processing" | "processed";

	@Column({ type: "text", nullable: true })
	meaning?: string;
}
