import { PickType } from "@nestjs/swagger";
import { WordDto } from "../../entities/word.dto";

export class DeleteWordRequestDto extends PickType(WordDto, ["id"] as const) {}
export class DeleteWordResponseDto extends PickType(WordDto, ["id"] as const) {}
