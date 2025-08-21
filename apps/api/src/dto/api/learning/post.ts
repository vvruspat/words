import { OmitType } from "@nestjs/swagger";
import { LearningDto } from "../../entities/learning.dto";

export class PostLearningRequestDto extends OmitType(LearningDto, ["id"]) {}

export class PostLearningResponseDto extends LearningDto {}
