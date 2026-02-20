import type { User } from "@vvruspat/words-types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity implements User {
	@PrimaryGeneratedColumn({ type: "int" })
	id: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	language_speak: string;

	@Column({ nullable: true })
	language_learn: string;

	@Column({ nullable: true, default: false })
	email_verified?: boolean;

	@Column({ nullable: true })
	password?: string;
}

export { UserEntity as User };
