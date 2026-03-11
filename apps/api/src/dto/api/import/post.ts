import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";

export class PostImportTopicsRequestDto {
	@ApiProperty({ description: "Language code (e.g. nl, de, es)" })
	@IsString()
	language: string;

	@ApiProperty({
		description:
			'Array of topics with level/word-count entries. Each item has a "topic" string key and optional level keys (e.g. A1, A2) with number values.',
		type: "array",
		items: {
			type: "object",
			additionalProperties: true,
		},
	})
	@IsArray()
	topics: Array<Record<string, string | number>>;
}

export class PostImportTopicsResponseDto {
	@ApiProperty({ description: "Number of newly created topics" })
	@IsNumber()
	topicsCreated: number;

	@ApiProperty({ description: "Number of already existing topics found" })
	@IsNumber()
	topicsFound: number;

	@ApiProperty({ description: "Number of word generation jobs queued" })
	@IsNumber()
	jobsQueued: number;
}
