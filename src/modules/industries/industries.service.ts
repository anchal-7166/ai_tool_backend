import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IndustryRepository } from './industries.repositories';
import { CreateIndustryDto, IndustryQueryDto, UpdateIndustryDto } from './industries.dto';
import { IndustryMapper, IndustryResponseDto } from './industries.mapper';


@Injectable()
export class IndustryService {
  constructor(private readonly industryRepository: IndustryRepository) {}

  async create(dto: CreateIndustryDto): Promise<IndustryResponseDto> {
    const [existingName, existingSlug] = await Promise.all([
      this.industryRepository.findByName(dto.name),
      this.industryRepository.findBySlug(dto.slug),
    ]);

    if (existingName) {
      throw new ConflictException(`Industry with name "${dto.name}" already exists.`);
    }
    if (existingSlug) {
      throw new ConflictException(`Industry with slug "${dto.slug}" already exists.`);
    }

    const industry = await this.industryRepository.create(dto);
    return IndustryMapper.toResponse(industry as any);
  }

  async findAll(query: IndustryQueryDto): Promise<IndustryResponseDto[]> {
    const industries = await this.industryRepository.findAllWithCount(query);
    return IndustryMapper.toResponseList(industries as any);
  }

  async findOne(id: string): Promise<IndustryResponseDto> {
    const industry = await this.industryRepository.findByIdWithCount(id);
    if (!industry) {
      throw new NotFoundException(`Industry with id "${id}" not found.`);
    }
    return IndustryMapper.toResponse(industry as any);
  }

  async findBySlug(slug: string): Promise<IndustryResponseDto> {
    const industry = await this.industryRepository.findBySlugWithCount(slug);
    if (!industry) {
      throw new NotFoundException(`Industry with slug "${slug}" not found.`);
    }
    return IndustryMapper.toResponse(industry as any);
  }

  async update(id: string, dto: UpdateIndustryDto): Promise<IndustryResponseDto> {
    const existing = await this.industryRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Industry with id "${id}" not found.`);
    }

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.industryRepository.findByName(dto.name);
      if (conflict) throw new ConflictException(`Name "${dto.name}" is already taken.`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.industryRepository.findBySlug(dto.slug);
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken.`);
    }

    const updated = await this.industryRepository.update(id, dto);
    return IndustryMapper.toResponse(updated as any);
  }

  async remove(id: string): Promise<void> {
    const industry = await this.industryRepository.findById(id);
    if (!industry) {
      throw new NotFoundException(`Industry with id "${id}" not found.`);
    }
    await this.industryRepository.delete(id);
  }
}