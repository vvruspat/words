import { ApiProperty } from "@nestjs/swagger";
import type {
	DeleteVocabCatalogRequest,
	DeleteVocabCatalogResponse,
	VocabCatalog,
} from "@repo/types";
import { ApiResponseStatus } from "@repo/types";
import { VocabCatalogDto } from "../../entities/vocab-catalog.dto";

export class DeleteVocabCatalogRequestDto implements DeleteVocabCatalogRequest {
	@ApiProperty({ type: String, format: "int64" })
	id!: VocabCatalog["id"];
}

export class DeleteVocabCatalogResponseDto
	implements DeleteVocabCatalogResponse
{
	@ApiProperty({ enum: ApiResponseStatus })
	status!: ApiResponseStatus;
	@ApiProperty({ type: String, required: false })
	message?: string;
	@ApiProperty({ type: VocabCatalogDto, required: false })
	data?: VocabCatalog;
	@ApiProperty({ required: false })
	error?: unknown;
}
