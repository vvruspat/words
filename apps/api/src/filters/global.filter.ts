import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { SentryExceptionCaptured } from "@sentry/nestjs";
import {
	type ApiResponseError,
	ApiResponseStatus,
} from "@vvruspat/words-types";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	@SentryExceptionCaptured()
	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let details: Record<string, string> | undefined;

		if (!(exception instanceof HttpException)) {
			this.logger.error(
				"Unhandled exception",
				exception instanceof Error ? exception.stack : exception,
			);
		}

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
