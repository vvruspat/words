import { ApiProperty } from "@nestjs/swagger";
import type {
	PostVocabCatalogRequest,
	PostVocabCatalogResponse,
	VocabCatalog,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class PostVocabCatalogRequestDto implements PostVocabCatalogRequest {
	@ApiProperty({ type: String, format: "date-time" })
	created_at!: VocabCatalog["created_at"];
	@ApiProperty({ type: String, format: "int64" })
	owner!: VocabCatalog["owner"];
	@ApiProperty({ type: String })
	title!: VocabCatalog["title"];
	@ApiProperty({ type: String, required: false })
	description?: VocabCatalog["description"];
	@ApiProperty({ type: String })
	language!: VocabCatalog["language"];
	@ApiProperty({ type: String, required: false })
	image?: VocabCatalog["image"];
}

export class PostVocabCatalogResponseDto implements PostVocabCatalogResponse {
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: VocabCatalogDto, required: false })
	data?: VocabCatalog;
	@ApiProperty({ required: false })
	error?: unknown;
}
