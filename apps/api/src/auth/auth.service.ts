import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import {
	PostSignInResponseDto,
	PostSignUpRequestDto,
	PostSignUpResponseDto,
} from "~/dto";
import { MailerService, MailTemplate } from "~/mailer/mailer.service";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService,
	) {}

	async signIn(email: string, pass: string): Promise<PostSignInResponseDto> {
		const user = await this.userService.findOneByEmail(email);

		const isMatch = await bcrypt.compare(pass, user?.password);

		if (!isMatch) {
			throw new UnauthorizedException("Invalid credentials");
		}

		const payload = { sub: user.id, email: user.email };
		const accessToken = this.jwtService.sign(payload, {
			expiresIn:
				this.configService.get<string | number>("JWT_EXPIRES_IN") || "1h",
			secret: this.configService.get<string>("JWT_SECRET"),
		});
		const refreshToken = this.jwtService.sign(payload, {
			expiresIn:
				this.configService.get<string | number>("JWT_REFRESH_EXPIRES_IN") ||
				"7d",
			secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
		});

		delete user.password;

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
		password: PostSignUpRequestDto["password"],
	): Promise<PostSignUpResponseDto> {
		const salt = Number(this.configService.get<string>("BCRYPT_SALT_ROUNDS"));

		const hashedPassword = await bcrypt.hash(password, salt);

		const existingUser = await this.userService.findOneByEmail(email);

		if (existingUser) {
			throw new BadRequestException("User already exists");
		}

		await this.userService.create({
			email,
			name,
			password: hashedPassword,
		});

		const verifyEmailToken = this.jwtService.sign(
			{ email },
			{
				expiresIn:
					this.configService.get<string | number>("VERIFY_EMAIL_EXPIRES_IN") ||
					"1h",
				secret: this.configService.get<string>("JWT_SECRET"),
			},
		);

		this.mailerService.sendMail({
			to: [{ email }],
			templateId: MailTemplate.CONFIRM_EMAIL,
			params: {
				name,
				link: `${this.configService.get("DOMAIN")}/verify-email?token=${verifyEmailToken}`,
			},
		});

		return this.signIn(email, password);
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

		return this.signIn(user.email, user.password);
	}

	async verifyEmail(token: string) {
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

		await this.userService.setEmailVerified(user.id);
	}

	async sendResetPasswordEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);

		if (!user) {
			throw new UnauthorizedException();
		}

		const token = this.jwtService.sign(
			{ sub: user.id, email: user.email },
			{
				expiresIn:
					this.configService.get<string | number>(
						"RESET_PASSWORD_EXPIRES_IN",
					) || "1h",
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
