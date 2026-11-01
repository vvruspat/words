import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import type { SocialProvider } from "./social-auth.dto";

@Entity("social_identity")
export class SocialIdentityEntity {
	@PrimaryColumn({
		type: "varchar",
		length: 16,
		primaryKeyConstraintName: "social_identity_pkey",
	})
	provider: SocialProvider;

	@PrimaryColumn({
		type: "varchar",
		length: 255,
		primaryKeyConstraintName: "social_identity_pkey",
	})
	subject: string;

	@Column({ type: "int" })
	user_id: number;

	@ManyToOne(() => UserEntity, { onDelete: "CASCADE", nullable: false })
	@JoinColumn({
		name: "user_id",
		foreignKeyConstraintName: "social_identity_user_fk",
	})
	user: UserEntity;
}
