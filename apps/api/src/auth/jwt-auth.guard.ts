import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ADMIN_ONLY_KEY } from "./admin-only.decorator";
import { AuthService } from "./auth.service";
import type { AuthenticatedRequest } from "./authenticated-request";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
		const token = this.authService.getBearerToken(
			request.headers.authorization,
		);

		if (!token) {
			throw new UnauthorizedException("Missing bearer token");
		}

		request.user = await this.authService.getUserFromAuthorizationHeader(
			request.headers.authorization,
		);
		const claims = this.authService.verifyAccessToken(token);
		request.auth = {
			token,
			authorizationHeader: `Bearer ${token}`,
			claims,
		};

		const isAdminOnly = this.reflector.getAllAndOverride<boolean>(
			ADMIN_ONLY_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (isAdminOnly && claims.admin !== true) {
			throw new ForbiddenException("Administrator access required");
		}

		return true;
	}
}
