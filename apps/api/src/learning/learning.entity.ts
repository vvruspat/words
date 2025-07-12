import {
	Learning,
	LearningData,
	Training,
	WordData,
	WordsTranslation,
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
import { WordsTranslationEntity } from "../wordstranslation/wordstranslation.entity";

@Entity({ name: "learning" })
export class LearningEntity implements Learning {
	@PrimaryGeneratedColumn({ type: "number" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "number" })
	user: number;

	@Column({ type: "number" })
	word: number;

	@Column({ type: "int" })
	score: number;

	@Column({ type: "timestamp" })
	last_review: string;

	@Column({ type: "number" })
	training: number;

	@Column({ type: "number" })
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

	@OneToOne(() => WordsTranslationEntity)
	@JoinColumn()
	translationData: WordsTranslation;
}
