import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
	constructor(private readonly userService: UserService) {}

	async validateUser(email: string, password: string) {
		const users = await this.userService.findAll({
			limit: 1,
			offset: 0,
			email,
		});
		if (!users[0]) {
			throw new UnauthorizedException("Invalid login or password");
		}
		const isMatch = await bcrypt.compare(password, users[0].password);
		if (!isMatch) {
			throw new UnauthorizedException("Invalid login or password");
		}

		delete users[0].password; // Remove password from the response for security

		return users[0];
	}
}
