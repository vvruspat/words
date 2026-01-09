import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "src/constants/database.constants";
import type { Repository } from "typeorm";
import type { GetUserRequestDto } from "~/dto";
import type { UserEntity } from "./user.entity";

@Injectable()
export class UserService {
	constructor(
		@Inject(USER_REPOSITORY)
		private userRepository: Repository<UserEntity>,
	) {}

	async findAll({
		offset,
		limit,
		...query
	}: GetUserRequestDto): Promise<UserEntity[]> {
		return this.userRepository.find({
			where: {
				...query,
			},
			skip: offset,
			take: limit,
			order: {
				created_at: "DESC",
			},
		});
	}

	async findOne(id: UserEntity["id"]): Promise<UserEntity> {
		return this.userRepository.findOneBy({ id });
	}

	async findOneByEmail(email: UserEntity["email"]): Promise<UserEntity> {
		return this.userRepository.findOneBy({ email });
	}

	async create(
		user: Omit<UserEntity, "id" | "created_at">,
	): Promise<UserEntity> {
		const newUser = this.userRepository.create(user);
		return this.userRepository.save(newUser);
	}

	async update(user: Partial<UserEntity>): Promise<UserEntity> {
		await this.userRepository.update(user.id, user);
		return this.findOne(user.id);
	}

	async remove(id: UserEntity["id"]): Promise<void> {
		await this.userRepository.delete(id);
	}

	async setEmailVerified(id: UserEntity["id"]): Promise<void> {
		await this.userRepository.update(id, { email_verified: true });
	}
}
