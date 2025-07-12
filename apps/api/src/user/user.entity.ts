import { User } from "@repo/types";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity implements User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	created_at: string;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	name: string;
}

export { UserEntity as User };
