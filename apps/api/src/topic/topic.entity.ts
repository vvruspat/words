import { Topic } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "topic" })
export class TopicEntity implements Topic {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column()
	title: string;

	@Column({ nullable: true })
	description: string;

	@Column({ nullable: true })
	image?: string | null;

	@Column({ type: "bigint", nullable: true })
	catalog: number;
}

export type { Topic };
