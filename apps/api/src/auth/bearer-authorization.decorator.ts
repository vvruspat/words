import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthenticatedRequest } from "./authenticated-request";

export const BearerAuthorization = createParamDecorator(
	(_data: unknown, context: ExecutionContext): string => {
		return context.switchToHttp().getRequest<AuthenticatedRequest>().auth
			.authorizationHeader;
	},
);
