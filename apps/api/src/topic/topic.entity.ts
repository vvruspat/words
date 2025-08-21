import { Topic } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "topic" })
export class TopicEntity implements Topic {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz" })
	created_at: string;

	@Column()
	title: string;

	@Column()
	description: string;

	@Column({ type: "bigint" })
	catalog: number;

	@Column({ nullable: true })
	image?: string | null;
}

export type { Topic };
