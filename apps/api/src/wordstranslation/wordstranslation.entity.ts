import { WordsTranslation } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "words_translation" })
export class WordsTranslationEntity implements WordsTranslation {
	@PrimaryGeneratedColumn({ type: "number" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "number" })
	word: number;

	@Column()
	translation: string;

	@Column()
	language: string;
}
