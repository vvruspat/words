import { ApiProperty, IntersectionType, PartialType } from "@nestjs/swagger";
import {
	ApiPaginatedRequestDto,
	ApiPaginatedResponseDto,
	UserDto,
} from "~/dto/entities";

export class GetUserRequestDto extends IntersectionType(
	ApiPaginatedRequestDto,
	PartialType(UserDto),
) {}

export class GetUserResponseDto extends ApiPaginatedResponseDto<UserDto> {
	@ApiProperty({
		type: [UserDto],
		description: "List of users",
	})
	items: UserDto[];
}
