import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UseCaseRepository } from './use-case.repository';
import { CreateUseCaseDto, UpdateUseCaseDto, UseCaseQueryDto } from './use-case.dto';
import { UseCaseMapper, UseCaseResponseDto } from './use-case.mapper';


@Injectable()
export class UseCaseService {
  constructor(private readonly useCaseRepository: UseCaseRepository) {}

  async create(dto: CreateUseCaseDto): Promise<UseCaseResponseDto> {
    const [existingTitle, existingSlug] = await Promise.all([
      this.useCaseRepository.findByTitle(dto.title),
      this.useCaseRepository.findBySlug(dto.slug),
    ]);

    if (existingTitle) {
      throw new ConflictException(`Use case with title "${dto.title}" already exists.`);
    }
    if (existingSlug) {
      throw new ConflictException(`Use case with slug "${dto.slug}" already exists.`);
    }

    const useCase = await this.useCaseRepository.create(dto);
    return UseCaseMapper.toResponse(useCase as any);
  }

  async findAll(query: UseCaseQueryDto): Promise<UseCaseResponseDto[]> {
    const useCases = await this.useCaseRepository.findAllWithCount(query);
    return UseCaseMapper.toResponseList(useCases as any);
  }

  async findOne(id: string): Promise<UseCaseResponseDto> {
    const useCase = await this.useCaseRepository.findByIdWithCount(id);
    if (!useCase) {
      throw new NotFoundException(`Use case with id "${id}" not found.`);
    }
    return UseCaseMapper.toResponse(useCase as any);
  }

  async findBySlug(slug: string): Promise<UseCaseResponseDto> {
    const useCase = await this.useCaseRepository.findBySlugWithCount(slug);
    if (!useCase) {
      throw new NotFoundException(`Use case with slug "${slug}" not found.`);
    }
    return UseCaseMapper.toResponse(useCase as any);
  }

  async update(id: string, dto: UpdateUseCaseDto): Promise<UseCaseResponseDto> {
    const existing = await this.useCaseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Use case with id "${id}" not found.`);
    }

    if (dto.title && dto.title !== existing.title) {
      const conflict = await this.useCaseRepository.findByTitle(dto.title);
      if (conflict) throw new ConflictException(`Title "${dto.title}" is already taken.`);
    }

    if (dto.slug && dto.slug !== existing.slug) {
      const conflict = await this.useCaseRepository.findBySlug(dto.slug);
      if (conflict) throw new ConflictException(`Slug "${dto.slug}" is already taken.`);
    }

    const updated = await this.useCaseRepository.update(id, dto);
    return UseCaseMapper.toResponse(updated as any);
  }

  async remove(id: string): Promise<void> {
    const useCase = await this.useCaseRepository.findById(id);
    if (!useCase) {
      throw new NotFoundException(`Use case with id "${id}" not found.`);
    }
    await this.useCaseRepository.delete(id);
  }
}