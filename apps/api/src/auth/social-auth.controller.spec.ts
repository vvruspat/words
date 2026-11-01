import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { SocialAuthController } from "./social-auth.controller";
import { SocialAuthService } from "./social-auth.service";
import type { SocialSignInRequestDto } from "./social-auth.dto";

describe("social auth HTTP validation", () => {
	let app: INestApplication;
	const service = {
		challenge: jest.fn(async () => ({ challenge_id: "test", nonce: "nonce" })),
		signIn: jest.fn(async (_dto: SocialSignInRequestDto) => ({
			access_token: "access",
			refresh_token: "refresh",
			user: { id: 1 },
		})),
	};
	beforeAll(async () => {
		const module = await Test.createTestingModule({
			controllers: [SocialAuthController],
			providers: [{ provide: SocialAuthService, useValue: service }],
		}).compile();
		app = module.createNestApplication({ logger: false });
		await app.init();
	});
	afterAll(async () => {
		await app.close();
	});
	it("exposes public challenge and sign-in routes with the existing session shape", async () => {
		await request(app.getHttpServer())
			.post("/auth/social/challenge")
			.send({ provider: "apple" })
			.expect(200);
		const dto: SocialSignInRequestDto = {
			provider: "google",
			challenge_id: "cf74bd96-d45b-4990-8d6a-fadba35e9c00",
			id_token: "token",
		};
		const response = await request(app.getHttpServer())
			.post("/auth/social/signin")
			.send(dto)
			.expect(200);
		expect(response.body.access_token).toBe("access");
		expect(service.signIn).toHaveBeenCalledWith(dto);
	});
	it.each([
		{
			provider: "attacker",
			challenge_id: "cf74bd96-d45b-4990-8d6a-fadba35e9c00",
			id_token: "token",
		},
		{ provider: "apple", challenge_id: "invalid", id_token: "token" },
		{
			provider: "apple",
			challenge_id: "cf74bd96-d45b-4990-8d6a-fadba35e9c00",
			id_token: "",
		},
		{
			provider: "apple",
			challenge_id: "cf74bd96-d45b-4990-8d6a-fadba35e9c00",
			id_token: "token",
			email: "attacker@example.com",
		},
	])("rejects invalid or client-controlled identity claims before exchanging", async (body) => {
		service.signIn.mockClear();
		await request(app.getHttpServer())
			.post("/auth/social/signin")
			.send(body)
			.expect(400);
		expect(service.signIn).not.toHaveBeenCalled();
	});
});
