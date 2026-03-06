import type { TopicTranslation } from "@vvruspat/words-types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "topic_translation" })
export class TopicTranslationEntity implements TopicTranslation {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ type: "int" })
	topic: number;

	@Column()
	translation: string;

	@Column()
	language: string;
}
