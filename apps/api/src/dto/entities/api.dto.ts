import { ApiProperty } from "@nestjs/swagger";
import { type ApiPaginatedResponse, type ApiResponseError } from "@repo/types";

export class ApiResponseErrorDto implements ApiResponseError {
	@ApiProperty({ type: String })
	message!: string;

	@ApiProperty({ type: Object, required: false })
	details?: Record<string, string>;
}

export class ApiPaginatedResponseDto<T> implements ApiPaginatedResponse<T> {
	@ApiProperty({ type: Number, example: 100 })
	total: number;

	@ApiProperty({ type: Number, example: 0 })
	offset: number;

	@ApiProperty({ type: Number, example: 10 })
	limit: number;
}

export class ApiPaginatedRequestDto {
	@ApiProperty({ type: Number, example: 0 })
	offset: number;

	@ApiProperty({ type: Number, example: 10 })
	limit: number;
}
