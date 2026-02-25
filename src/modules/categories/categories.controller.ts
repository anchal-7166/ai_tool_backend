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
import { CategoryService } from './categories.service';
import { CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './catgories.dto';
import { CategoryResponseDto } from './categories.mapper';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * POST /categories
   * Create a new category.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoryService.create(dto);
  }

  /**
   * GET /categories
   * List categories with optional filters (search, parentId, rootOnly, skip, take).
   */
  @Get()
  async findAll(@Query() query: CategoryQueryDto): Promise<CategoryResponseDto[]> {
    return this.categoryService.findAll(query);
  }

  /**
   * GET /categories/tree
   * Get full hierarchical category tree.
   */
  @Get('tree')
  async findTree(): Promise<CategoryResponseDto[]> {
    return this.categoryService.findTree();
  }

  /**
   * GET /categories/slug/:slug
   * Find a category by its slug.
   */
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    return this.categoryService.findBySlug(slug);
  }

  /**
   * GET /categories/:id
   * Find a category by its UUID.
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.findOne(id);
  }

  /**
   * PATCH /categories/:id
   * Partially update a category.
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoryService.update(id, dto);
  }

  /**
   * DELETE /categories/:id
   * Remove a category (fails if it has subcategories).
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.remove(id);
  }
}