import {
	Injectable,
	ServiceUnavailableException,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { JwksClient } from "jwks-rsa";
import type { JwtPayload } from "jsonwebtoken";
import type { SocialProvider } from "./social-auth.dto";

export interface SocialClaims extends JwtPayload {
	nonce?: string;
	email?: string;
	email_verified?: boolean | string;
	name?: string;
	hd?: string;
}

@Injectable()
export class SocialTokenVerifier {
	private readonly clients = {
		apple: new JwksClient({
			jwksUri: "https://appleid.apple.com/auth/keys",
			cache: true,
			rateLimit: true,
			timeout: 5000,
		}),
		google: new JwksClient({
			jwksUri: "https://www.googleapis.com/oauth2/v3/certs",
			cache: true,
			rateLimit: true,
			timeout: 5000,
		}),
	};

	constructor(
		private readonly config: ConfigService,
		private readonly jwt: JwtService,
	) {}

	assertConfigured(provider: SocialProvider): [string, ...string[]] {
		const audience = this.config
			.get<string>(
				provider === "apple" ? "APPLE_CLIENT_IDS" : "GOOGLE_WEB_CLIENT_IDS",
			)
			?.split(",")
			.map((id) => id.trim())
			.filter(Boolean);
		if (!audience?.length)
			throw new ServiceUnavailableException("Social sign-in is not configured");
		return [audience[0], ...audience.slice(1)];
	}

	async verify(
		provider: SocialProvider,
		token: string,
		nonce: string,
	): Promise<SocialClaims> {
		const audience = this.assertConfigured(provider);
		try {
			const decoded = this.jwt.decode(token, { complete: true });
			if (!decoded || typeof decoded !== "object" || !("header" in decoded))
				throw new Error("Invalid JWT");
			const header = decoded.header;
			if (header.alg !== "RS256" || !header.kid)
				throw new Error("Invalid JWT header");
			const key = await this.clients[provider].getSigningKey(header.kid);
			const claims = await this.jwt.verifyAsync<SocialClaims>(token, {
				publicKey: key.getPublicKey(),
				algorithms: ["RS256"],
				audience,
				issuer:
					provider === "apple"
						? "https://appleid.apple.com"
						: ["https://accounts.google.com", "accounts.google.com"],
			});
			if (
				typeof claims.exp !== "number" ||
				typeof claims.sub !== "string" ||
				!claims.sub ||
				claims.sub.length > 255 ||
				claims.nonce !== nonce
			)
				throw new Error("Invalid JWT claims");
			return claims;
		} catch {
			throw new UnauthorizedException("Invalid social sign-in token");
		}
	}
}
