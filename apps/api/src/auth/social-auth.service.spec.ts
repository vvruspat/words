import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { Test } from "@nestjs/testing";
import { DATA_SOURCE } from "../constants/database.constants";
import { UserEntity } from "../user/user.entity";
import { AuthService } from "./auth.service";
import { SocialAuthService } from "./social-auth.service";
import { SocialIdentityEntity } from "./social-identity.entity";
import {
	SocialTokenVerifier,
	type SocialClaims,
} from "./social-token-verifier";

describe("SocialAuthService", () => {
	let service: SocialAuthService;
	let claims: SocialClaims;
	let stored: Map<string, string>;
	let users: UserEntity[];
	let identity: { user: UserEntity } | null;
	const dto = {
		provider: "google" as const,
		challenge_id: "challenge",
		id_token: "provider-token",
	};
	const verifier = {
		assertConfigured: jest.fn(),
		verify: jest.fn<SocialTokenVerifier["verify"]>(async () => claims),
	};
	const redis = {
		get: jest.fn(async (key: string) => stored.get(key) ?? null),
		set: jest.fn(
			async (key: string, value: string, _expiry: string, _seconds: number) => {
				stored.set(key, value);
				return "OK";
			},
		),
		getdel: jest.fn(async (key: string) => {
			const result = stored.get(key);
			stored.delete(key);
			return result ?? null;
		}),
	};
	const auth = {
		getAccessToken: jest.fn(async (_user: UserEntity) => ({
			access_token: "access",
			refresh_token: "refresh",
		})),
	};
	const queryBuilder = {
		where: jest.fn().mockReturnThis(),
		getMany: jest.fn(async () => users),
	};
	const manager = {
		query: jest.fn(async (_query: string, _params: string[]) => []),
		findOne: jest.fn(async () => identity),
		createQueryBuilder: jest.fn(() => queryBuilder),
		create: jest.fn((_entity: unknown, data: object) => ({ ...data })),
		save: jest.fn(async (entity: unknown, data: object) =>
			entity === UserEntity ? { id: 10, ...data } : data,
		),
	};
	const database = {
		transaction: jest.fn(
			async (callback: (input: typeof manager) => Promise<UserEntity>) =>
				callback(manager),
		),
	};
	beforeEach(async () => {
		jest.clearAllMocks();
		stored = new Map([["social-signin:google:challenge", "nonce"]]);
		claims = {
			sub: "stable-id",
			nonce: "nonce",
			email: "user@gmail.com",
			email_verified: true,
			name: "Google Name",
		};
		users = [];
		identity = null;
		const module = await Test.createTestingModule({
			providers: [
				SocialAuthService,
				{ provide: SocialTokenVerifier, useValue: verifier },
				{ provide: AuthService, useValue: auth },
				{ provide: "REDIS_CLIENT", useValue: redis },
				{ provide: DATA_SOURCE, useValue: database },
			],
		}).compile();
		service = module.get(SocialAuthService);
	});
	it("issues a random short-lived nonce bound to one provider", async () => {
		const first = await service.challenge("apple");
		const second = await service.challenge("apple");
		expect(first.nonce).toMatch(/^[a-f0-9]{64}$/);
		expect(first.nonce).not.toBe(second.nonce);
		expect(redis.set).toHaveBeenCalledWith(
			`social-signin:apple:${first.challenge_id}`,
			first.nonce,
			"EX",
			300,
		);
	});
	it("creates a verified account requiring onboarding and stores the provider subject", async () => {
		const result = await service.signIn(dto);
		expect(result.user).toMatchObject({
			email_verified: true,
			onboarded: false,
			name: "Google Name",
		});
		expect(manager.save).toHaveBeenCalledWith(SocialIdentityEntity, {
			provider: "google",
			subject: "stable-id",
			user_id: 10,
		});
		expect(manager.query).toHaveBeenCalledWith(
			expect.stringContaining("pg_advisory_xact_lock"),
			["social:google:stable-id"],
		);
	});
	it("reuses existing verified email accounts without losing progress identity or settings", async () => {
		users = [
			Object.assign(new UserEntity(), {
				id: 22,
				email: "user@gmail.com",
				onboarded: true,
				language_learn: "nl",
				email_verified: true,
				password: "secret-hash",
			}),
		];
		const result = await service.signIn(dto);
		expect(result.user).toMatchObject({
			id: 22,
			language_learn: "nl",
			onboarded: true,
		});
		expect(result.user).not.toHaveProperty("password");
		expect(manager.save).toHaveBeenCalledWith(
			SocialIdentityEntity,
			expect.objectContaining({ user_id: 22 }),
		);
	});
	it("recognizes returning Apple users by subject even without email or name", async () => {
		stored.set("social-signin:apple:challenge", "nonce");
		claims = { sub: "apple-stable-id", nonce: "nonce" };
		identity = {
			user: Object.assign(new UserEntity(), {
				id: 30,
				email: "private@privaterelay.appleid.com",
				onboarded: true,
			}),
		};
		expect((await service.signIn({ ...dto, provider: "apple" })).user.id).toBe(
			30,
		);
		expect(manager.createQueryBuilder).not.toHaveBeenCalled();
	});
	it("accepts Apple's private relay and first-authorization name", async () => {
		stored.set("social-signin:apple:challenge", "nonce");
		claims = {
			sub: "apple-stable-id",
			nonce: "nonce",
			email: "private@privaterelay.appleid.com",
			email_verified: "true",
		};
		expect(
			(await service.signIn({ ...dto, provider: "apple", name: "Apple Name" }))
				.user,
		).toMatchObject({
			name: "Apple Name",
			email: "private@privaterelay.appleid.com",
		});
	});
	it("rejects unverified first-time emails before creating or linking accounts", async () => {
		claims.email_verified = false;
		await expect(service.signIn(dto)).rejects.toThrow(
			"A verified provider email is required",
		);
		expect(manager.save).not.toHaveBeenCalled();
		expect(auth.getAccessToken).not.toHaveBeenCalled();
	});
	it("refuses automatic linking for Google accounts with a non-authoritative third-party email", async () => {
		claims.email = "user@example.com";
		users = [Object.assign(new UserEntity(), { id: 22, email: claims.email })];
		await expect(service.signIn(dto)).rejects.toThrow("Sign in by email");
		expect(auth.getAccessToken).not.toHaveBeenCalled();
	});
	it("links Google Workspace accounts with verified domain claims", async () => {
		claims.email = "user@example.com";
		claims.hd = "example.com";
		users = [
			Object.assign(new UserEntity(), {
				id: 22,
				email: claims.email,
				email_verified: true,
			}),
		];
		expect((await service.signIn(dto)).user.id).toBe(22);
	});
	it("does not accept a challenge issued for another provider", async () => {
		await expect(service.signIn({ ...dto, provider: "apple" })).rejects.toThrow(
			"Sign-in challenge expired",
		);
		expect(verifier.verify).not.toHaveBeenCalled();
	});
	it("consumes a challenge once across concurrent submissions", async () => {
		const results = await Promise.allSettled([
			service.signIn(dto),
			service.signIn(dto),
		]);
		expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
		expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
		expect(auth.getAccessToken).toHaveBeenCalledTimes(1);
	});
	it("does not burn a valid challenge or write users when verification fails", async () => {
		verifier.verify.mockRejectedValueOnce(new Error("Invalid signature"));
		await expect(service.signIn(dto)).rejects.toThrow("Invalid signature");
		expect(redis.getdel).not.toHaveBeenCalled();
		expect(manager.save).not.toHaveBeenCalled();
	});
});
