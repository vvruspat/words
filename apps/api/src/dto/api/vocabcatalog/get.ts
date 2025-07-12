import { ApiProperty } from "@nestjs/swagger";
import type {
	GetVocabCatalogRequest,
	GetVocabCatalogResponse,
	VocabCatalog,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class GetVocabCatalogRequestDto implements GetVocabCatalogRequest {
	@ApiProperty({ type: String, format: "int64", required: false })
	id?: VocabCatalog["id"];
	@ApiProperty({ type: String, format: "date-time", required: false })
	created_at?: VocabCatalog["created_at"];
	@ApiProperty({ type: String, format: "int64", required: false })
	owner?: VocabCatalog["owner"];
	@ApiProperty({ type: String, required: false })
	title?: VocabCatalog["title"];
	@ApiProperty({ type: String, required: false })
	language?: VocabCatalog["language"];
	@ApiProperty({ type: String, required: false })
	image?: VocabCatalog["image"];
	@ApiProperty({ type: Number, required: false })
	limit?: number;
	@ApiProperty({ type: Number, required: false })
	offset?: number;
}

export class GetVocabCatalogResponseDto implements GetVocabCatalogResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: [VocabCatalogDto], required: false })
	data?: VocabCatalog[];
	@ApiProperty({ required: false })
	error?: unknown;
	@ApiProperty({ type: Number })
	total!: number;
	@ApiProperty({ type: Number })
	limit!: number;
	@ApiProperty({ type: Number })
	offset!: number;
}
