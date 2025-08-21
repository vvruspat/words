import { ApiProperty } from "@nestjs/swagger";
import type { User } from "@repo/types";

export class UserDto implements User {
	@ApiProperty({ type: Number, format: "int64" })
	id!: number;

	@ApiProperty({ type: "string", format: "date-time" })
	created_at!: string;

	@ApiProperty({ type: "string" })
	email!: string;

	@ApiProperty({ type: "string" })
	name!: string;
}
