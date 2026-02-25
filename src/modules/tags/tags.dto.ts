import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export enum TagSortBy {
  NAME = 'name',
  USAGE_COUNT = 'usageCount',
  CREATED_AT = 'createdAt',
}

export class CreateTagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  slug: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class TagQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TagSortBy)
  sortBy?: TagSortBy;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}