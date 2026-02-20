import { ApiProperty } from "@nestjs/swagger";
import {
	AVAILABLE_LANGUAGES,
	type Language,
	type Topic,
	type VocabCatalog,
	type Word,
	type WordData,
} from "@vvruspat/words-types";
import { TopicDto } from "./topic.dto";
import { VocabCatalogDto } from "./vocab-catalog.dto";

export class WordDto implements Word {
	@ApiProperty({ enum: ["processing", "processed"] })
	status: "processing" | "processed";

	@ApiProperty({ type: Number })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: Number })
	topic!: number;

	@ApiProperty({ type: "string" })
	word: string;

	@ApiProperty({ type: Number })
	catalog!: number;

	@ApiProperty({ enum: Object.keys(AVAILABLE_LANGUAGES) })
	language!: Language;

	@ApiProperty({ type: "string" })
	audio!: string;

	@ApiProperty({ type: "string" })
	transcribtion!: string;

	@ApiProperty({ type: String, required: false })
	meaning?: string;
}

export class WordDataDto extends WordDto implements WordData {
	@ApiProperty({ type: TopicDto, required: true })
	topicData!: Topic;

	@ApiProperty({ type: VocabCatalogDto, required: true })
	catalogData!: VocabCatalog;
}
