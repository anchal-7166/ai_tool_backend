import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class EntityFilterOptions  {
  @ApiProperty({ example: "users" })
  @IsString()
  entity: string;
}
