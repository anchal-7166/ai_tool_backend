import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateIndustryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;
}

export class UpdateIndustryDto extends PartialType(CreateIndustryDto) {}

export class IndustryQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}