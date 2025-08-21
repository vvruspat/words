import {
	Learning,
	LearningData,
	Training,
	WordData,
	WordTranslation,
} from "@repo/types";
import {
	Column,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { TrainingEntity } from "../training/training.entity";
import { WordDataEntity } from "../word/word.entity";
import { WordTranslationEntity } from "../wordstranslation/wordstranslation.entity";

@Entity({ name: "learning" })
export class LearningEntity implements Learning {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "bigint" })
	user: number;

	@Column({ type: "bigint" })
	word: number;

	@Column({ type: "int" })
	score: number;

	@Column({ type: "timestamp" })
	last_review: string;

	@Column({ type: "bigint" })
	training: number;

	@Column({ type: "bigint" })
	translation: number;
}

@Entity({ name: "learning_data" })
export class LearningDataEntity extends LearningEntity implements LearningData {
	@OneToOne(() => WordDataEntity)
	@JoinColumn()
	wordData: WordData;

	@OneToOne(() => TrainingEntity)
	@JoinColumn()
	trainingData: Training;

	@OneToOne(() => WordTranslationEntity)
	@JoinColumn()
	translationData: WordTranslation;
}
