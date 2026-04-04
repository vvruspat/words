import type {
	LearningData,
	WordData,
	WordTranslation,
} from "@vvruspat/words-types";
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { WordEntity } from "../word/word.entity";
import { WordTranslationEntity } from "../wordstranslation/wordstranslation.entity";

@Entity({ name: "learning" })
export class LearningEntity implements LearningData {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "int" })
	user: number;

	@Column({ type: "int" })
	word: number;

	@Column({ type: "int" })
	score: number;

	@Column({ type: "timestamp" })
	last_review: string;

	@Column({ type: "varchar" })
	training: string;

	@Column({ type: "int" })
	translation: number;

	@ManyToOne(() => WordEntity)
	@JoinColumn({ name: "word" })
	wordData: WordData;

	@ManyToOne(() => WordTranslationEntity)
	@JoinColumn({ name: "translation" })
	translationData: WordTranslation;
}
