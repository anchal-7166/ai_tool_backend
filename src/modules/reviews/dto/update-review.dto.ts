// src/modules/reviews/dto/update-review.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'Great tool!' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated my review after using it more.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}