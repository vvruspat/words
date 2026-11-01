import { generateKeyPairSync } from "node:crypto";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConfigService } from "@nestjs/config";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import { SocialTokenVerifier } from "./social-token-verifier";

const mockGetSigningKey =
	jest.fn<() => Promise<{ getPublicKey: () => string }>>();
jest.mock("jwks-rsa", () => ({
	JwksClient: jest
		.fn()
		.mockImplementation(() => ({ getSigningKey: () => mockGetSigningKey() })),
}));

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
	modulusLength: 2048,
});
const jwt = new JwtService();
const pem = publicKey.export({ type: "spki", format: "pem" }).toString();

describe("SocialTokenVerifier", () => {
	const config = new ConfigService({
		APPLE_CLIENT_IDS: "digital.whitesquirrel.wordsapp",
		GOOGLE_WEB_CLIENT_IDS: "web-client-id",
	});
	const verifier = new SocialTokenVerifier(config, jwt);
	beforeEach(() => {
		mockGetSigningKey.mockClear();
		mockGetSigningKey.mockResolvedValue({ getPublicKey: () => pem });
	});
	function token(payload: object = {}, options: object = {}) {
		const signOptions: JwtSignOptions = {
			privateKey,
			algorithm: "RS256",
			keyid: "test-key",
			audience: "web-client-id",
			issuer: "https://accounts.google.com",
			expiresIn: "5m",
			...options,
		};
		if (signOptions.expiresIn === undefined) delete signOptions.expiresIn;
		return jwt.sign(
			{
				sub: "provider-user",
				nonce: "challenge-nonce",
				email: "test@gmail.com",
				email_verified: true,
				...payload,
			},
			signOptions,
		);
	}

	it("verifies Google signatures and restricts the audience to configured web clients", async () => {
		await expect(
			verifier.verify("google", token(), "challenge-nonce"),
		).resolves.toMatchObject({ sub: "provider-user" });
	});
	it("verifies Apple signature, bundle audience and string email_verified claim", async () => {
		await expect(
			verifier.verify(
				"apple",
				token(
					{ email_verified: "true" },
					{
						issuer: "https://appleid.apple.com",
						audience: "digital.whitesquirrel.wordsapp",
					},
				),
				"challenge-nonce",
			),
		).resolves.toMatchObject({ email_verified: "true" });
	});
	it.each([
		["wrong audience", {}, { audience: "foreign-app" }],
		["wrong issuer", {}, { issuer: "https://attacker.example" }],
		["expired token", {}, { expiresIn: -1 }],
		["wrong nonce", { nonce: "another-challenge" }, {}],
		["missing nonce", { nonce: undefined }, {}],
		["missing subject", { sub: undefined }, {}],
		["missing expiry", {}, { expiresIn: undefined }],
	])("rejects %s", async (_name, payload, options) => {
		await expect(
			verifier.verify("google", token(payload, options), "challenge-nonce"),
		).rejects.toThrow("Invalid social sign-in token");
	});
	it("rejects a valid token signed with another private key", async () => {
		const other = generateKeyPairSync("rsa", { modulusLength: 2048 });
		await expect(
			verifier.verify(
				"google",
				token({}, { privateKey: other.privateKey }),
				"challenge-nonce",
			),
		).rejects.toThrow();
	});
	it("rejects symmetric algorithms and malformed tokens before looking up keys", async () => {
		const symmetric = jwt.sign(
			{ sub: "user", nonce: "challenge-nonce" },
			{ secret: "attacker", algorithm: "HS256" },
		);
		for (const value of [symmetric, "malformed"])
			await expect(
				verifier.verify("google", value, "challenge-nonce"),
			).rejects.toThrow();
		expect(mockGetSigningKey).not.toHaveBeenCalled();
	});
	it("fails closed when a provider is unconfigured", () => {
		expect(() =>
			new SocialTokenVerifier(new ConfigService(), jwt).assertConfigured(
				"apple",
			),
		).toThrow("Social sign-in is not configured");
	});
});
