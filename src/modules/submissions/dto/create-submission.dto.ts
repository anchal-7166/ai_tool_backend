import {
  IsString,
  IsOptional,
  IsUrl,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformType, TargetAudience } from '@prisma/client';
import { PricingPlanDto } from './pricing-plan.dto';
import { ScreenshotDto } from './screenshots.dto';
import { IntegrationDto } from './integration.dto';


export class CreateSubmissionDto {

  // ==================== BASIC INFO ====================

  @ApiProperty({ example: 'ChatGPT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'chatgpt' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'The most powerful AI assistant for everyone' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  tagline: string;

  @ApiProperty({ example: 'ChatGPT is an AI chatbot developed by OpenAI...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  description: string;

  @ApiPropertyOptional({ example: '## Full Description\n\nMore details here...' })
  @IsOptional()
  @IsString()
  longDescription?: string;

  // ==================== URLS ====================

  @ApiPropertyOptional({ example: 'https://chat.openai.com' })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'https://chat.openai.com/demo' })
  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @ApiPropertyOptional({ example: 'https://platform.openai.com/docs' })
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=demo' })
  @IsOptional()
  @IsUrl()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  // ==================== TECHNICAL DETAILS ====================

  @ApiPropertyOptional({ example: 'GPT-4' })
  @IsOptional()
  @IsString()
  aiModel?: string;

  @ApiPropertyOptional({ example: ['WEB', 'API'], enum: PlatformType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PlatformType, { each: true })
  platformType?: PlatformType[];

  @ApiPropertyOptional({ example: ['DEVELOPERS', 'MARKETERS'], enum: TargetAudience, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TargetAudience, { each: true })
  targetAudience?: TargetAudience[];

  @ApiPropertyOptional({ example: ['ai writing', 'content generation'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  searchKeywords?: string[];

  // ==================== PRICING PLANS ====================

  @ApiProperty({
    description: 'Pricing plans — at least 1 required (even if FREE)',
    type: [PricingPlanDto],
    example: [
      { name: 'Free', type: 'FREE', price: 0, features: ['10 requests/day'] },
      { name: 'Pro', type: 'SUBSCRIPTION', price: 20, billingCycle: 'MONTHLY',
        trialDays: 14, features: ['Unlimited requests', 'API access'], monthlyRequests: 10000 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PricingPlanDto)
  pricingPlans: PricingPlanDto[];

  // ==================== SCREENSHOTS ====================

  @ApiPropertyOptional({
    description: 'Screenshots of the tool UI (max 10)',
    type: [ScreenshotDto],
    example: [
      { url: 'https://cdn.example.com/screenshot-1.png', caption: 'Main dashboard', order: 1 },
      { url: 'https://cdn.example.com/screenshot-2.png', caption: 'Settings panel',  order: 2 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ScreenshotDto)
  screenshots?: ScreenshotDto[];

  // ==================== INTEGRATIONS ====================

  @ApiPropertyOptional({
    description: 'Third-party integrations the tool supports (max 20)',
    type: [IntegrationDto],
    example: [
      { name: 'Slack',  description: 'Send outputs to Slack', url: 'https://slack.com' },
      { name: 'Zapier', description: 'Connect with 5000+ apps', url: 'https://zapier.com' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => IntegrationDto)
  integrations?: IntegrationDto[];


  // ==================== RELATIONS — IDs FROM FRONTEND SELECT BARS ====================

@ApiPropertyOptional({
  description: 'Category IDs — picked from categories select bar (max 5)',
  example: ['cat-0000-0000-0000-000000000001', 'cat-0000-0000-0000-000000000004'],
})
@IsOptional()
@IsArray()
@IsString({ each: true })
@ArrayMaxSize(5)
categoryIds?: string[];

@ApiPropertyOptional({
  description: 'Tag IDs — picked from tags select bar (max 10)',
  example: ['tag-0000-0000-0000-000000000001', 'tag-0000-0000-0000-000000000010'],
})
@IsOptional()
@IsArray()
@IsString({ each: true })
@ArrayMaxSize(10)
tagIds?: string[];

@ApiPropertyOptional({
  description: 'Use Case IDs — picked from use cases select bar (max 8)',
  example: ['uc-00000-0000-0000-000000000001', 'uc-00000-0000-0000-000000000008'],
})
@IsOptional()
@IsArray()
@IsString({ each: true })
@ArrayMaxSize(8)
useCaseIds?: string[];

@ApiPropertyOptional({
  description: 'Industry IDs — picked from industries select bar (max 5)',
  example: ['ind-0000-0000-0000-000000000001', 'ind-0000-0000-0000-000000000003'],
})
@IsOptional()
@IsArray()
@IsString({ each: true })
@ArrayMaxSize(5)
industryIds?: string[];


}