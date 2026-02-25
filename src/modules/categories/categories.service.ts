import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoryRepository } from './categories.repository';
import { CategoryMapper, CategoryResponseDto } from './categories.mapper';
import { CategoryQueryDto, CreateCategoryDto, UpdateCategoryDto } from './catgories.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Ensure unique name & slug
    const [existingName, existingSlug] = await Promise.all([
      this.categoryRepository.findByName(dto.name),
      this.categoryRepository.findBySlug(dto.slug),
    ]);

    if (existingName) {
      throw new ConflictException(`Category with name "${dto.name}" already exists.`);
    }
    if (existingSlug) {
      throw new ConflictException(`Category with slug "${dto.slug}" already exists.`);
    }

    // Validate parent exists
    if (dto.parentId) {
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category with id "${dto.parentId}" not found.`);
      }
    }

    const category = await this.categoryRepository.create(dto);
    return CategoryMapper.toResponse(category as any);
  }

  async findAll(query: CategoryQueryDto): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAllWithRelations(query);
    return CategoryMapper.toResponseList(categories as any);
  }

  async findTree(): Promise<CategoryResponseDto[]> {
    const tree = await this.categoryRepository.findTree();
    return CategoryMapper.toResponseList(tree as any);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findByIdWithRelations(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found.`);
    }
    return CategoryMapper.toResponse(category as any);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found.`);
    }
    return CategoryMapper.toResponse(category as any);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Category with id "${id}" not found.`);
    }

    // Check slug/name conflicts only if they changed
    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.categoryRepository.findByName(dto.name);
      if (conflict) throw new ConflictException(`Name "${dto.name}" is already taken.`);
    }
    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.categoryRepository.findBySlug(dto.slug);
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken.`);
    }

    // Prevent circular hierarchy
    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent.');
      }
      const parent = await this.categoryRepository.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(`Parent category "${dto.parentId}" not found.`);
      }
    }

    const updated = await this.categoryRepository.update(id, dto);
    return CategoryMapper.toResponse(updated as any);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findByIdWithRelations(id);
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found.`);
    }

    // Prevent deleting categories that still have children
    const withChildren = category as any;
    if (withChildren.children?.length > 0) {
      throw new BadRequestException(
        'Cannot delete a category that has subcategories. Remove or reassign subcategories first.',
      );
    }

    await this.categoryRepository.delete(id);
  }
}