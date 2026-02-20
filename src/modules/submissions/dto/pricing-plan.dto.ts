import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType, BillingCycle } from '@prisma/client';

export class PricingPlanDto {
  @ApiProperty({ example: 'Pro Plan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PricingType, example: 'SUBSCRIPTION' })
  @IsEnum(PricingType)
  type: PricingType;

  @ApiPropertyOptional({ example: 29.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: BillingCycle, example: 'MONTHLY' })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiPropertyOptional({ example: 'Full access to all features' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['Unlimited requests', 'Priority support', 'API access'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minSeats?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  monthlyRequests?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  storageLimit?: number;
}