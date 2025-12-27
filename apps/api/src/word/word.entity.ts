import { Language, Topic, VocabCatalog, Word, WordData } from "@repo/types";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

	@Column({ type: "int" })
	catalog: number;

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

@Entity({ name: "word_data" })
export class WordDataEntity extends WordEntity implements WordData {
	@OneToOne(() => TopicEntity)
	topicData: Topic;

	@OneToOne(() => VocabCatalogEntity)
	catalogData: VocabCatalog;
}
