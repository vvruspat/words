import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { type ApiResponseError, ApiResponseStatus } from "@repo/types";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let details: Record<string, string> | undefined;

		if (exception instanceof HttpException) {
			status = exception.getStatus();

			const res = exception.getResponse();

			if (typeof res === "string") {
				message = res;
			} else if (typeof res === "object" && res !== null) {
				message = (res as ApiResponseError).message || message;
				details = (res as ApiResponseError).details;
			}
		}

		response.status(status).json({
			status: ApiResponseStatus.ERROR,
			error: {
				statusCode: status,
				message,
				details,
			},
		});
	}
}
