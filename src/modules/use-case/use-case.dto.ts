import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUseCaseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title: string;

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

export class UpdateUseCaseDto extends PartialType(CreateUseCaseDto) {}

export class UseCaseQueryDto {
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