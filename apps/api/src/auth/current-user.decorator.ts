import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { UserEntity } from "~/user/user.entity";
import type { AuthenticatedRequest } from "./authenticated-request";

export const CurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): UserEntity => {
		return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
	},
);
