import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { UserEntity } from "~/user/user.entity";
import type { RequestWithAuth } from "./authenticated-request";

export const OptionalCurrentUser = createParamDecorator(
	(_data: unknown, context: ExecutionContext): UserEntity | undefined => {
		return context.switchToHttp().getRequest<RequestWithAuth>().user;
	},
);
