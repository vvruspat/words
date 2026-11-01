import { randomBytes, randomUUID } from "node:crypto";
import {
	ConflictException,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type Redis from "ioredis";
import { DataSource } from "typeorm";
import { DATA_SOURCE } from "../constants/database.constants";
import { UserEntity } from "../user/user.entity";
import { AuthService } from "./auth.service";
import type {
	SocialChallengeResponseDto,
	SocialProvider,
	SocialSignInRequestDto,
} from "./social-auth.dto";
import { SocialIdentityEntity } from "./social-identity.entity";
import {
	SocialTokenVerifier,
	type SocialClaims,
} from "./social-token-verifier";

@Injectable()
export class SocialAuthService {
	constructor(
		private readonly verifier: SocialTokenVerifier,
		private readonly auth: AuthService,
		@Inject("REDIS_CLIENT") private readonly redis: Redis,
		@Inject(DATA_SOURCE) private readonly database: DataSource,
	) {}

	async challenge(
		provider: SocialProvider,
	): Promise<SocialChallengeResponseDto> {
		this.verifier.assertConfigured(provider);
		const challenge_id = randomUUID();
		const nonce = randomBytes(32).toString("hex");
		await this.redis.set(
			this.challengeKey(provider, challenge_id),
			nonce,
			"EX",
			300,
		);
		return { challenge_id, nonce };
	}

	async signIn(dto: SocialSignInRequestDto) {
		const key = this.challengeKey(dto.provider, dto.challenge_id);
		const nonce = await this.redis.get(key);
		if (!nonce)
			throw new UnauthorizedException(
				"Sign-in challenge expired or already used",
			);
		const claims = await this.verifier.verify(
			dto.provider,
			dto.id_token,
			nonce,
		);
		// GETDEL makes consumption atomic across concurrent requests and API instances.
		if ((await this.redis.getdel(key)) !== nonce)
			throw new UnauthorizedException("Sign-in challenge already used");
		const user = await this.resolveUser(dto, claims);
		const tokens = await this.auth.getAccessToken(user);
		const publicUser = { ...user };
		delete publicUser.password;
		return { ...tokens, user: publicUser };
	}

	private challengeKey(provider: SocialProvider, id: string) {
		return `social-signin:${provider}:${id}`;
	}

	private async resolveUser(
		dto: SocialSignInRequestDto,
		claims: SocialClaims,
	): Promise<UserEntity> {
		return this.database.transaction(async (manager) => {
			// Serialize first sign-ins for an identity, then by email for cross-provider races.
			await manager.query(
				"SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
				[`social:${dto.provider}:${claims.sub}`],
			);
			const identity = await manager.findOne(SocialIdentityEntity, {
				where: { provider: dto.provider, subject: claims.sub },
				relations: { user: true },
			});
			if (identity) return identity.user;

			const email =
				typeof claims.email === "string"
					? claims.email.trim().toLowerCase()
					: "";
			const verified =
				claims.email_verified === true || claims.email_verified === "true";
			if (!email || !verified)
				throw new UnauthorizedException(
					"A verified provider email is required on first sign-in",
				);
			await manager.query(
				"SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
				[`social-email:${email}`],
			);
			const matches = await manager
				.createQueryBuilder(UserEntity, "user")
				.where("LOWER(user.email) = :email", { email })
				.getMany();
			// Google is authoritative for Gmail and verified Workspace domains only.
			const authoritative =
				dto.provider === "apple" ||
				email.endsWith("@gmail.com") ||
				Boolean(claims.hd);
			if (matches.length > 1 || (matches.length === 1 && !authoritative))
				throw new ConflictException(
					"Sign in by email to use your existing account",
				);
			let user = matches[0];
			if (!user) {
				user = await manager.save(
					UserEntity,
					manager.create(UserEntity, {
						email,
						email_verified: true,
						onboarded: false,
						name:
							(dto.provider === "apple" ? dto.name : claims.name)
								?.trim()
								.slice(0, 200) || email,
					}),
				);
			} else if (!user.email_verified) {
				user.email_verified = true;
				user = await manager.save(UserEntity, user);
			}
			await manager.save(
				SocialIdentityEntity,
				manager.create(SocialIdentityEntity, {
					provider: dto.provider,
					subject: claims.sub,
					user_id: user.id,
				}),
			);
			return user;
		});
	}
}
