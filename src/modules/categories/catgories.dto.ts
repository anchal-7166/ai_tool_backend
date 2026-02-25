import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  rootOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}