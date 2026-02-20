import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { FILTER_CONSTANTS } from "../constants/filter.constants";

// Individual filter object
export class IndividualFilterObject {
  @ApiProperty({ 
    example: FILTER_CONSTANTS.OPERATORS.IN,
    enum: FILTER_CONSTANTS.OPERATORS.ALL()
  })
  @IsString()
  @IsEnum(FILTER_CONSTANTS.OPERATORS.ALL())
  op: string;

  @ApiProperty({ example: "platformType", description: "Field path to filter on" })
  @IsString()
  path: string;

  // @IsOptional()
  // @ApiProperty({ 
  //   example: ["WEB", "API"],
  //   description: "Filter value(s) - can be string, number, array, or date"
  // })
  // value: string | number | readonly string[] | readonly number[] | Date | { start: Date; end: Date };
  
    @Transform(({ value }) => {
      // Already array → OK
      if (Array.isArray(value)) return value;

      // Convert single value → array
      if (typeof value === 'string' || typeof value === 'number') {
        return [value];
      }

      return value;
    })
    @IsOptional()
    value: any;



}

// Sort/Order object
export class FilterOrderObject {
  @ApiProperty({ example: "createdAt", description: "Field to sort by" })
  @IsString()
  orderBy: string = 'createdAt';

  @ApiProperty({
    example: FILTER_CONSTANTS.ORDER.DEFAULT_SORT_ORDER,
    enum: FILTER_CONSTANTS.ORDER.ORDER_LIST(),
  })
  @IsString()
  @IsEnum(FILTER_CONSTANTS.ORDER.ORDER_LIST())
  order: "asc" | "desc" = "desc";
}

// Base filter query with pagination
export class FilterQueryObject {
  @ApiPropertyOptional({ 
    example: FILTER_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
    minimum: 1,
    maximum: FILTER_CONSTANTS.PAGINATION.MAX_LIMIT
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(FILTER_CONSTANTS.PAGINATION.MAX_LIMIT)
  limit?: number = FILTER_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

  @ApiPropertyOptional({ 
    example: FILTER_CONSTANTS.PAGINATION.DEFAULT_PAGE,
    minimum: 1
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number = FILTER_CONSTANTS.PAGINATION.DEFAULT_PAGE;

  @ApiPropertyOptional({ type: FilterOrderObject })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterOrderObject)
  sort?: FilterOrderObject;

  @ApiProperty({ type: [IndividualFilterObject], default: [] })
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => IndividualFilterObject)
  filters: IndividualFilterObject[] = [];
}

// Entity filter query (includes entity name)
export class EntityFilterQueryObject extends FilterQueryObject {
  @ApiProperty({ example: "tools", enum: FILTER_CONSTANTS.ENTITIES.ALL() })
  @IsString()
  @IsEnum(FILTER_CONSTANTS.ENTITIES.ALL())
  entity: string;
}