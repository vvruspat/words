import type { VocabCatalog } from "@vvruspat/words-types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "vocab_catalogs" })
export class VocabCatalogEntity implements VocabCatalog {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({
		type: "timestamptz",
		nullable: true,
		default: () => "CURRENT_TIMESTAMP",
	})
	created_at: string;

	@Column({ type: "int" })
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
