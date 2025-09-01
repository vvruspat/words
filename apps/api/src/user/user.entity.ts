import type { User } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity implements User {
	@PrimaryGeneratedColumn({ type: "bigint" })
	id: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	name: string;

	@Column({ nullable: true })
	password?: string;

	@Column({ nullable: true, default: false })
	email_verified?: boolean;
}

export { UserEntity as User };
