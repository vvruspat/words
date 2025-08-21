import { ApiProperty } from "@nestjs/swagger";
import type { Topic, VocabCatalog, Word, WordData } from "@repo/types";
import { TopicDto } from "./topic.dto";
import { VocabCatalogDto } from "./vocab-catalog.dto";

export class WordDto implements Word {
	@ApiProperty({ type: Number, format: "int64" })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string", format: "int64" })
	topic!: number;

	@ApiProperty({ type: "string", format: "int64" })
	catalog!: number;

	@ApiProperty({ type: "string" })
	language!: string;
}

export class WordDataDto extends WordDto implements WordData {
	@ApiProperty({ type: TopicDto, required: true })
	topicData!: Topic;

	@ApiProperty({ type: VocabCatalogDto, required: true })
	catalogData!: VocabCatalog;
}
