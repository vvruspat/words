import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { RequestWithAuth } from "./authenticated-request";

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
	constructor(private readonly authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<RequestWithAuth>();
		const token = this.authService.getBearerToken(
			request.headers.authorization,
		);

		if (!token) {
			return true;
		}

		request.user = await this.authService.getUserFromAuthorizationHeader(
			request.headers.authorization,
		);
		request.auth = {
			token,
			authorizationHeader: `Bearer ${token}`,
			claims: this.authService.verifyAccessToken(token),
		};

		return true;
	}
}
