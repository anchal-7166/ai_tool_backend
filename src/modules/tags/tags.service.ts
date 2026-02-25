import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TagRepository } from './tags.repository';
import { CreateTagDto, TagQueryDto, UpdateTagDto } from './tags.dto';
import { TagMapper, TagResponseDto } from './tags.mapper';


@Injectable()
export class TagService {
  constructor(private readonly tagRepository: TagRepository) {}

  async create(dto: CreateTagDto): Promise<TagResponseDto> {
    const [existingName, existingSlug] = await Promise.all([
      this.tagRepository.findByName(dto.name),
      this.tagRepository.findBySlug(dto.slug),
    ]);

    if (existingName) {
      throw new ConflictException(`Tag with name "${dto.name}" already exists.`);
    }
    if (existingSlug) {
      throw new ConflictException(`Tag with slug "${dto.slug}" already exists.`);
    }

    const tag = await this.tagRepository.create(dto);
    return TagMapper.toResponse(tag);
  }

  async findAll(query: TagQueryDto): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findAllWithQuery(query);
    return TagMapper.toResponseList(tags);
  }

  async findPopular(limit?: number): Promise<TagResponseDto[]> {
    const tags = await this.tagRepository.findPopular(limit);
    return TagMapper.toResponseList(tags);
  }

  async findOne(id: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundException(`Tag with id "${id}" not found.`);
    return TagMapper.toResponse(tag);
  }

  async findBySlug(slug: string): Promise<TagResponseDto> {
    const tag = await this.tagRepository.findBySlug(slug);
    if (!tag) throw new NotFoundException(`Tag with slug "${slug}" not found.`);
    return TagMapper.toResponse(tag);
  }

  async update(id: string, dto: UpdateTagDto): Promise<TagResponseDto> {
    const existing = await this.tagRepository.findById(id);
    if (!existing) throw new NotFoundException(`Tag with id "${id}" not found.`);

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.tagRepository.findByName(dto.name);
      if (conflict) throw new ConflictException(`Name "${dto.name}" is already taken.`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.tagRepository.findBySlug(dto.slug);
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken.`);
    }

    const updated = await this.tagRepository.update(id, dto);
    return TagMapper.toResponse(updated);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.tagRepository.findById(id);
    if (!tag) throw new NotFoundException(`Tag with id "${id}" not found.`);
    await this.tagRepository.delete(id);
  }

  // ─── Usage Count Helpers (called from ToolTag operations) ─────────────────

  async incrementUsage(id: string): Promise<void> {
    await this.tagRepository.incrementUsageCount(id);
  }

  async decrementUsage(id: string): Promise<void> {
    await this.tagRepository.decrementUsageCount(id);
  }
}