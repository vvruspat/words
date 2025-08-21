import { PartialType } from "@nestjs/swagger";
import { WordDto } from "../../entities/word.dto";

export class PutWordRequestDto extends PartialType(WordDto) {
	id!: number;
}
export class PutWordResponseDto extends WordDto {}
