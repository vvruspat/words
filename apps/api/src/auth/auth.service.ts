import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	Logger,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type Redis from "ioredis";
import type { SignOptions } from "jsonwebtoken";
import type {
	PostSignInResponseDto,
	PostSignUpRequestDto,
	PostSignUpResponseDto,
} from "~/dto";
import { MailerService, MailTemplate } from "~/mailer/mailer.service";
import type { UserEntity } from "~/user/user.entity";
import { UserService } from "../user/user.service";

type SupabaseUser = {
	id: string;
	email?: string;
	app_metadata?: Record<string, unknown>;
	user_metadata?: Record<string, unknown>;
	email_confirmed_at?: string | null;
	confirmed_at?: string | null;
};

type SupabaseUserResponse = {
	user?: SupabaseUser;
};

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService,
		@Inject("REDIS_CLIENT") private readonly redis: Redis,
	) {}

	async getAccessToken(
		user: UserEntity,
		extraClaims: Record<string, unknown> = {},
	) {
		const payload = { ...extraClaims, sub: user.id, email: user.email };
		const accessExpiresIn = (this.configService.get<string | number>(
			"JWT_EXPIRES_IN",
		) || "14d") as SignOptions["expiresIn"];
		const refreshExpiresIn = (this.configService.get<string | number>(
			"JWT_REFRESH_EXPIRES_IN",
		) || "60d") as SignOptions["expiresIn"];
		const accessToken = this.jwtService.sign(payload, {
			expiresIn: accessExpiresIn,
			secret: this.configService.get<string>("JWT_SECRET"),
		});
		const refreshToken = this.jwtService.sign(payload, {
			expiresIn: refreshExpiresIn,
			secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
		});

		const result = {
			access_token: accessToken,
			refresh_token: refreshToken,
		};

		return result;
	}

	getBearerToken(authorization?: string | string[]): string | null {
		const value = Array.isArray(authorization)
			? authorization[0]
			: authorization;

		if (!value) {
			return null;
		}

		const [scheme, token] = value.split(" ");

		if (scheme?.toLowerCase() !== "bearer" || !token) {
			return null;
		}

		return token;
	}

	async getUserFromAuthorizationHeader(
		authorization?: string | string[],
	): Promise<UserEntity> {
		const token = this.getBearerToken(authorization);

		if (!token) {
			throw new UnauthorizedException("Missing bearer token");
		}

		let decoded: { sub?: number | string };

		try {
			decoded = this.jwtService.verify(token, {
				secret: this.configService.get<string>("JWT_SECRET"),
			});
		} catch {
			throw new UnauthorizedException("Invalid bearer token");
		}

		if (!decoded?.sub) {
			throw new UnauthorizedException();
		}

		const userId = Number(decoded.sub);

		if (!Number.isFinite(userId)) {
			throw new UnauthorizedException();
		}

		const user = await this.userService.findOne(userId);

		if (!user) {
			throw new UnauthorizedException();
		}

		return user;
	}

	verifyAccessToken(token: string): Record<string, unknown> {
		try {
			return this.jwtService.verify<Record<string, unknown>>(token, {
				secret: this.configService.get<string>("JWT_SECRET"),
			});
		} catch {
			throw new UnauthorizedException("Invalid bearer token");
		}
	}

	async getOptionalUserFromAuthorizationHeader(
		authorization?: string | string[],
	): Promise<UserEntity | null> {
		const token = this.getBearerToken(authorization);

		if (!token) {
			return null;
		}

		return this.getUserFromAuthorizationHeader(authorization);
	}

	async exchangeSupabaseToken(
		authorization?: string | string[],
	): Promise<PostSignInResponseDto> {
		const token = this.getBearerToken(authorization);

		if (!token) {
			throw new UnauthorizedException("Missing Supabase bearer token");
		}

		const supabaseUser = await this.getSupabaseUser(token);

		if (!this.isSupabaseAdmin(supabaseUser)) {
			throw new ForbiddenException("Supabase user is not an admin");
		}

		if (!supabaseUser.email) {
			throw new UnauthorizedException("Supabase user email is missing");
		}

		const user = await this.findOrCreateSupabaseUser(supabaseUser);
		const tokens = await this.getAccessToken(user, {
			auth_provider: "supabase",
			supabase_user_id: supabaseUser.id,
			admin: true,
		});

		return { ...tokens, user };
	}

	async signIn(email: string, pass: string): Promise<PostSignInResponseDto> {
		const user = await this.userService.findOneByEmail(email);

		const hashedPassword = await this.redis.get(`tmp-password:${email}`);

		const passwordHash = hashedPassword || user?.password;

		if (!passwordHash || !user) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const isMatch = await bcrypt.compare(pass, passwordHash);

		if (!isMatch) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const { access_token: accessToken, refresh_token: refreshToken } =
			await this.getAccessToken(user);

		const result = {
			user,
			access_token: accessToken,
			refresh_token: refreshToken,
		};

		return result;
	}

	private async getSupabaseUser(accessToken: string): Promise<SupabaseUser> {
		const supabaseUrl =
			this.configService.get<string>("SUPABASE_URL") ||
			this.configService.get<string>("NEXT_PUBLIC_SUPABASE_URL");
		const supabaseKey =
			this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY") ||
			this.configService.get<string>("SUPABASE_ANON_KEY") ||
			this.configService.get<string>("SUPABASE_PUBLISHABLE_KEY") ||
			this.configService.get<string>("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

		if (!supabaseUrl || !supabaseKey) {
			throw new BadRequestException("Supabase auth is not configured");
		}

		const response = await fetch(
			`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`,
			{
				headers: {
					apikey: supabaseKey,
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);

		if (!response.ok) {
			throw new UnauthorizedException("Invalid Supabase bearer token");
		}

		const data = (await response.json()) as SupabaseUser | SupabaseUserResponse;
		const user = "user" in data && data.user ? data.user : data;

		if (!("id" in user) || !user.id) {
			throw new UnauthorizedException("Invalid Supabase user response");
		}

		return user;
	}

	private isSupabaseAdmin(user: SupabaseUser): boolean {
		const adminEmails = this.configService
			.get<string>("SUPABASE_ADMIN_EMAILS")
			?.split(",")
			.map((email) => email.trim().toLowerCase())
			.filter(Boolean);
		const email = user.email?.toLowerCase();

		if (email && adminEmails?.includes(email)) {
			return true;
		}

		const metadata = user.app_metadata ?? {};
		const configuredRole =
			this.configService.get<string>("SUPABASE_ADMIN_ROLE") || "admin";
		const role = metadata.role;
		const roles = metadata.roles;

		if (role === configuredRole) {
			return true;
		}

		if (Array.isArray(roles) && roles.includes(configuredRole)) {
			return true;
		}

		if (
			typeof roles === "string" &&
			roles
				.split(",")
				.map((item) => item.trim())
				.includes(configuredRole)
		) {
			return true;
		}

		return metadata.admin === true || metadata.is_admin === true;
	}

	private async findOrCreateSupabaseUser(
		supabaseUser: SupabaseUser,
	): Promise<UserEntity> {
		const email = supabaseUser.email;

		if (!email) {
			throw new UnauthorizedException("Supabase user email is missing");
		}

		const existingUser = await this.userService.findOneByEmail(email);

		if (existingUser) {
			if (!existingUser.email_verified) {
				await this.userService.setEmailVerified(existingUser.id);
				return this.userService.findOne(existingUser.id);
			}

			return existingUser;
		}

		const name =
			typeof supabaseUser.user_metadata?.name === "string"
				? supabaseUser.user_metadata.name
				: typeof supabaseUser.user_metadata?.full_name === "string"
					? supabaseUser.user_metadata.full_name
					: email;

		return this.userService.create({
			email,
			name,
			email_verified: Boolean(
				supabaseUser.email_confirmed_at || supabaseUser.confirmed_at,
			),
			onboarded: true,
		});
	}

	async signUp(
		name: PostSignUpRequestDto["name"],
		email: PostSignUpRequestDto["email"],
		language_learn: PostSignUpRequestDto["language_learn"],
		language_speak: PostSignUpRequestDto["language_speak"],
	): Promise<PostSignUpResponseDto> {
		const existingUser = await this.userService.findOneByEmail(email);

		if (existingUser) {
			throw new BadRequestException("User already exists");
		}

		const user = await this.userService.create({
			email,
			name,
			language_speak,
			language_learn,
		});

		await this.sendVerificationEmail(email);

		const tokens = await this.getAccessToken(user);

		return { ...tokens, user };
	}

	async sendTmpPasswordToEmail(
		email: string,
	): Promise<{ is_new_user: boolean }> {
		let user = await this.userService.findOneByEmail(email);
		let is_new_user = false;

		if (!user) {
			user = await this.userService.create({
				email,
				email_verified: false,
				onboarded: false,
			});
			is_new_user = true;
		}

		await this.sendVerificationEmail(email);

		return { is_new_user };
	}

	async refreshToken(token: string): Promise<PostSignInResponseDto> {
		const decoded = this.jwtService.verify(token, {
			secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
		});

		const { exp, sub } = decoded;

		if (Date.now() >= exp * 1000) {
			throw new UnauthorizedException("Token expired");
		}

		if (!sub) {
			throw new UnauthorizedException();
		}

		const user = await this.userService.findOne(sub);

		if (!user) {
			throw new UnauthorizedException();
		}

		const { access_token: accessToken, refresh_token: refreshToken } =
			await this.getAccessToken(user);

		return {
			user,
			access_token: accessToken,
			refresh_token: refreshToken,
		};
	}

	async verifyEmail(
		email: string,
		code: string,
	): Promise<PostSignInResponseDto> {
		const storedCode = await this.redis.get(`verify-email:${email}`);

		this.logger.debug(
			`verifyEmail: email=${email} submitted=${code} stored=${storedCode}`,
		);

		if (!storedCode || storedCode.toUpperCase() !== code.toUpperCase()) {
			throw new BadRequestException("Invalid or expired verification code");
		}

		await this.redis.del(`verify-email:${email}`);

		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		await this.userService.setEmailVerified(user.id);

		const { access_token, refresh_token } = await this.getAccessToken(user);

		return { access_token, refresh_token, user };
	}

	async sendVerificationEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		const code = Array.from(
			{ length: 4 },
			() => chars[Math.floor(Math.random() * chars.length)],
		).join("");

		await this.redis.set(`verify-email:${email}`, code, "EX", 60 * 60 * 1); // 1 hour expiration

		await this.mailerService.sendMail({
			to: [{ email: user.email }],
			templateId: MailTemplate.CONFIRM_EMAIL,
			params: {
				name: user.name,
				code,
			},
		});
	}

	async sendResetPasswordEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		const resetPasswordExpiresIn = (this.configService.get<string | number>(
			"RESET_PASSWORD_EXPIRES_IN",
		) || "1h") as SignOptions["expiresIn"];
		const token = this.jwtService.sign(
			{ sub: user.id, email: user.email },
			{
				expiresIn: resetPasswordExpiresIn,
				secret: this.configService.get<string>("JWT_SECRET"),
			},
		);

		this.mailerService.sendMail({
			to: [{ email: user.email }],
			templateId: MailTemplate.RESET_PASSWORD,
			params: {
				name: user.name,
				link: `${this.configService.get("DOMAIN")}/reset-password?token=${token}`,
			},
		});
	}

	async resetPassword(newPassword: string, token: string) {
		const decoded = this.jwtService.verify(token, {
			secret: this.configService.get<string>("JWT_SECRET"),
		});

		const { email, exp } = decoded;

		if (Date.now() >= exp * 1000) {
			throw new UnauthorizedException("Token expired");
		}

		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		await this.userService.update({
			id: user.id,
			password: hashedPassword,
		});
	}
}
