// src/modules/reviews/dto/create-review.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Amazing tool!', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ example: 'This tool has transformed my workflow. Highly recommended!' })
  @IsString()
  @MaxLength(2000)
  comment: string;

  @ApiProperty({ example: 'chatgpt' })
  @IsString()
  toolSlug: string;
}