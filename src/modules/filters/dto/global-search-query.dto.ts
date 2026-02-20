import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PlatformType, TargetAudience, ToolStatus, PricingType } from '@prisma/client';
import { ToArray } from '../utils/toArray';

export class GlobalSearchQueryDto {
  @ApiProperty({ example: 'chatgpt', description: 'Search term for tools' })
  @IsString()
  @MinLength(1)
  prompt: string;

  // Search scope flags - which fields to search in
  @ApiPropertyOptional({ example: true, description: 'Search in all fields (name, tagline, description, keywords)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  all?: boolean = true;

  @ApiPropertyOptional({ description: 'Search only in tool name' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  name?: boolean;

  @ApiPropertyOptional({ description: 'Search only in tagline' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  tagline?: boolean;

  @ApiPropertyOptional({ description: 'Search only in description' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  description?: boolean;

  @ApiPropertyOptional({ description: 'Search only in AI model field' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  aiModel?: boolean;


  @ApiPropertyOptional({ enum: ToolStatus, description: 'Filter by tool status' })
  @IsOptional()
  @IsEnum(ToolStatus)
  status?: ToolStatus;

  @ApiPropertyOptional({ description: 'Only show published tools' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Only show featured tools' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Only show verified tools' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVerified?: boolean;


// platformType
@ApiPropertyOptional({ enum: PlatformType, isArray: true, description: 'Filter by platform types' })
@IsOptional()
@ToArray()
@IsArray()
@IsEnum(PlatformType, { each: true })
platformType?: PlatformType[];

// targetAudience
@ApiPropertyOptional({ enum: TargetAudience, isArray: true, description: 'Filter by target audience' })
@IsOptional()
@ToArray()
@IsArray()
@IsEnum(TargetAudience, { each: true })
targetAudience?: TargetAudience[];

// categories
@ApiPropertyOptional({ type: [String], description: 'Filter by category slugs' })
@IsOptional()
@ToArray()
@IsArray()
@IsString({ each: true })
categories?: string[];

// tags
@ApiPropertyOptional({ type: [String], description: 'Filter by tag slugs' })
@IsOptional()
@ToArray()
@IsArray()
@IsString({ each: true })
tags?: string[];


}


