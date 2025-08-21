import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "src/constants/database.constants";
import { Repository } from "typeorm";
import { GetUserRequestDto } from "~/dto";
import { UserEntity } from "./user.entity";

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

	async create(user: Omit<UserEntity, "id">): Promise<UserEntity> {
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
}
