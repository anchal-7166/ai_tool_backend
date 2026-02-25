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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TagService } from './tags.service';
import { CreateTagDto, TagQueryDto, UpdateTagDto } from './tags.dto';
import { TagResponseDto } from './tags.mapper';


@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * POST /tags
   * Create a new tag.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTagDto): Promise<TagResponseDto> {
    return this.tagService.create(dto);
  }

  /**
   * GET /tags
   * List all tags with optional search, sort & pagination.
   */
  @Get()
  async findAll(@Query() query: TagQueryDto): Promise<TagResponseDto[]> {
    return this.tagService.findAll(query);
  }

  /**
   * GET /tags/popular?limit=20
   * Get the most-used tags ordered by usageCount desc.
   */
  @Get('popular')
  async findPopular(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<TagResponseDto[]> {
    return this.tagService.findPopular(limit);
  }

  /**
   * GET /tags/slug/:slug
   * Find a tag by its slug.
   * Declared before /:id to avoid route shadowing.
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<TagResponseDto> {
    return this.tagService.findBySlug(slug);
  }

  /**
   * GET /tags/:id
   * Find a tag by UUID.
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TagResponseDto> {
    return this.tagService.findOne(id);
  }

  /**
   * PATCH /tags/:id
   * Partially update a tag.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    return this.tagService.update(id, dto);
  }

  /**
   * DELETE /tags/:id
   * Remove a tag.
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tagService.remove(id);
  }
}