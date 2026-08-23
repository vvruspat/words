import type { Request } from "express";
import type { UserEntity } from "~/user/user.entity";

export type RequestWithAuth = Request & {
	user?: UserEntity;
	auth?: {
		token: string;
		authorizationHeader: string;
		claims: Record<string, unknown>;
	};
};

export type AuthenticatedRequest = RequestWithAuth & {
	user: UserEntity;
	auth: {
		token: string;
		authorizationHeader: string;
		claims: Record<string, unknown>;
	};
};
