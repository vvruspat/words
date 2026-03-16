import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "word_synonym_group" })
export class WordSynonymGroupEntity {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "varchar" })
	language: string;

	@Column({ type: "int", array: true })
	word_ids: number[];

	@Column({
		type: "timestamptz",
		default: () => "CURRENT_TIMESTAMP",
	})
	calculated_at: string;
}
