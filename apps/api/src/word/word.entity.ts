import { Topic, VocabCatalog, Word, WordData } from "@repo/types";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TopicEntity } from "../topic/topic.entity";
import { VocabCatalogEntity } from "../vocabcatalog/vocabcatalog.entity";

@Entity({ name: "word" })
export class WordEntity implements Word {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "bigint" })
	topic: number;

	@Column({ type: "bigint" })
	catalog: number;

	@Column()
	language: string;
}

@Entity({ name: "word_data" })
export class WordDataEntity extends WordEntity implements WordData {
	@OneToOne(() => TopicEntity)
	topicData: Topic;

	@OneToOne(() => VocabCatalogEntity)
	catalogData: VocabCatalog;
}
