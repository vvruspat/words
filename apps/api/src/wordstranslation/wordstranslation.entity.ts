import type { WordTranslation } from "@vvruspat/words-types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "words_translation" })
export class WordTranslationEntity implements WordTranslation {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "int" })
	word: number;

	@Column()
	translation: string;

	@Column()
	language: string;
}
