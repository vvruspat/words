import type { WordTranslation } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "words_translation" })
export class WordTranslationEntity implements WordTranslation {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "bigint" })
	word: number;

	@Column()
	translation: string;

	@Column()
	language: string;
}
