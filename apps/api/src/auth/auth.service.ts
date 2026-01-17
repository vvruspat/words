import {
	BadRequestException,
	Inject,
	Injectable,
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

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService,
		@Inject("REDIS_CLIENT") private readonly redis: Redis,
	) {}

	async getAccessToken(user: UserEntity) {
		const payload = { sub: user.id, email: user.email };
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

		console.log(tokens);
		console.log(user);

		return { ...tokens, user };
	}

	async sendTmpPasswordToEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		const tmpPassword = Math.random().toString(36).slice(-4);

		const hashedPassword = await bcrypt.hash(tmpPassword, 10);

		await this.redis.set(
			`tmp-password:${email}`,
			hashedPassword,
			"EX",
			60 * 60 * 1,
		); // 1 hour expiration

		await this.mailerService.sendMail({
			to: [{ email: user.email }],
			templateId: MailTemplate.TEMPORARY_PASSWORD,
			params: {
				name: user.name,
				tmpPassword,
			},
		});
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

	async verifyEmail(email: string, code: string) {
		const storedCode = await this.redis.get(`verify-email:${email}`);

		if (!storedCode || storedCode !== code.toUpperCase()) {
			throw new BadRequestException("Invalid or expired verification code");
		}

		await this.redis.del(`verify-email:${email}`);

		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		await this.userService.setEmailVerified(user.id);
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
