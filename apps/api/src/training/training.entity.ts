import { Training } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "training" })
export class TrainingEntity implements Training {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column()
	name: string;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column()
	image: string;

	@Column({ type: "int" })
	score: number;
}
