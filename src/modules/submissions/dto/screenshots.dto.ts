import { IsString, IsOptional, IsUrl, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScreenshotDto {
  @ApiProperty({ example: 'https://cdn.example.com/screenshot-1.png' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ example: 'Dashboard showing AI analytics' })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}