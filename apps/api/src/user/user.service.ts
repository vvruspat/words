import { Inject, Injectable } from "@nestjs/common";
import { USER_REPOSITORY } from "src/constants/database.constants";
import { MoreThanOrEqual, type Repository } from "typeorm";
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

	async findUserStats(): Promise<{
		total: number;
		emailVerified: number;
		recentCount: number;
		byLanguageLearn: Array<{ language: string; count: number }>;
	}> {
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [total, emailVerified, recentCount] = await Promise.all([
			this.userRepository.count(),
			this.userRepository.count({ where: { email_verified: true } }),
			this.userRepository.count({
				where: { created_at: MoreThanOrEqual(thirtyDaysAgo.toISOString()) },
			}),
		]);

		const byLanguageLearnRaw = await this.userRepository
			.createQueryBuilder("u")
			.select("u.language_learn", "language")
			.addSelect("COUNT(*)", "count")
			.where("u.language_learn IS NOT NULL")
			.groupBy("u.language_learn")
			.orderBy("count", "DESC")
			.getRawMany<{ language: string; count: string }>();

		return {
			total,
			emailVerified,
			recentCount,
			byLanguageLearn: byLanguageLearnRaw.map((r) => ({
				language: r.language,
				count: Number(r.count),
			})),
		};
	}
}
