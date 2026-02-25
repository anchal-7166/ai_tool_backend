import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { IndustryService } from './industries.service';
import { CreateIndustryDto, IndustryQueryDto, UpdateIndustryDto } from './industries.dto';
import { IndustryResponseDto } from './industries.mapper';


@Controller('industries')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  /**
   * POST /industries
   * Create a new industry.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateIndustryDto): Promise<IndustryResponseDto> {
    return this.industryService.create(dto);
  }

  /**
   * GET /industries
   * List all industries with optional search & pagination.
   */
  @Get()
  async findAll(@Query() query: IndustryQueryDto): Promise<IndustryResponseDto[]> {
    return this.industryService.findAll(query);
  }

  /**
   * GET /industries/slug/:slug
   * Find an industry by slug.
   * Declared before /:id to avoid route shadowing.
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<IndustryResponseDto> {
    return this.industryService.findBySlug(slug);
  }

  /**
   * GET /industries/:id
   * Find an industry by UUID.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IndustryResponseDto> {
    return this.industryService.findOne(id);
  }

  /**
   * PATCH /industries/:id
   * Partially update an industry.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIndustryDto,
  ): Promise<IndustryResponseDto> {
    return this.industryService.update(id, dto);
  }

  /**
   * DELETE /industries/:id
   * Remove an industry.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.industryService.remove(id);
  }
}