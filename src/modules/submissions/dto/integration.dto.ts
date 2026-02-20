import { IsString, IsOptional, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IntegrationDto {
  @ApiProperty({ example: 'Slack' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Send AI-generated messages directly to Slack channels' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/slack-logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://slack.com' })
  @IsOptional()
  @IsUrl()
  url?: string;
}