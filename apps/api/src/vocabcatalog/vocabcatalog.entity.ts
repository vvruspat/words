import { VocabCatalog } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "vocab_catalog" })
export class VocabCatalogEntity implements VocabCatalog {
	@PrimaryGeneratedColumn({ type: "number" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column({ type: "number" })
	owner: number;

	@Column()
	title: string;

	@Column({ nullable: true })
	description?: string | null;

	@Column()
	language: string;

	@Column({ nullable: true })
	image?: string | null;
}
