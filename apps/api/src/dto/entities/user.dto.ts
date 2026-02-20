import { ApiProperty } from "@nestjs/swagger";
import type { User } from "@vvruspat/words-types";
import {
	IsDateString,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class UserDto implements User {
	@ApiProperty({ type: Number })
	@IsNumber()
	@IsOptional()
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	@IsDateString()
	created_at!: string;

	@ApiProperty({ type: "string" })
	@IsEmail()
	email!: string;

	@ApiProperty({ type: "string" })
	@IsString()
	@IsOptional()
	name: string;

	@ApiProperty({ type: "string" })
	@IsString()
	@IsOptional()
	language_speak: string;

	@ApiProperty({ type: "string" })
	@IsString()
	@IsOptional()
	language_learn: string;

	@ApiProperty({ type: "boolean", required: false, default: false })
	@IsOptional()
	email_verified?: boolean;

	@ApiProperty({ type: "string", required: false })
	@IsString()
	@IsOptional()
	password?: string;
}
