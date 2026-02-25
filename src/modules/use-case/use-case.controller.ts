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
import { UseCaseService } from './use-case.service';
import { CreateUseCaseDto, UpdateUseCaseDto, UseCaseQueryDto } from './use-case.dto';
import { UseCaseResponseDto } from './use-case.mapper';


@Controller('use-cases')
export class UseCaseController {
  constructor(private readonly useCaseService: UseCaseService) {}

  /**
   * POST /use-cases
   * Create a new use case.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUseCaseDto): Promise<UseCaseResponseDto> {
    return this.useCaseService.create(dto);
  }

  /**
   * GET /use-cases
   * List all use cases with optional search & pagination.
   */
  @Get()
  async findAll(@Query() query: UseCaseQueryDto): Promise<UseCaseResponseDto[]> {
    return this.useCaseService.findAll(query);
  }

  /**
   * GET /use-cases/slug/:slug
   * Find a use case by slug.
   * Declared before /:id to avoid route shadowing.
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<UseCaseResponseDto> {
    return this.useCaseService.findBySlug(slug);
  }

  /**
   * GET /use-cases/:id
   * Find a use case by UUID.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UseCaseResponseDto> {
    return this.useCaseService.findOne(id);
  }

  /**
   * PATCH /use-cases/:id
   * Partially update a use case.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUseCaseDto,
  ): Promise<UseCaseResponseDto> {
    return this.useCaseService.update(id, dto);
  }

  /**
   * DELETE /use-cases/:id
   * Remove a use case.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.useCaseService.remove(id);
  }
}