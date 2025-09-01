import { ApiProperty } from "@nestjs/swagger";
import type { User } from "@repo/types";
import {
	IsDateString,
	IsEmail,
	IsNumber,
	IsOptional,
	IsString,
} from "class-validator";

export class UserDto implements User {
	@ApiProperty({ type: Number, format: "int64" })
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
}
