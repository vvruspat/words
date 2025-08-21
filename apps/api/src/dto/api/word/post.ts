import { OmitType } from "@nestjs/swagger";
import { WordDto } from "../../entities/word.dto";

export class PostWordRequestDto extends OmitType(WordDto, ["id"] as const) {}
export class PostWordResponseDto extends WordDto {}
