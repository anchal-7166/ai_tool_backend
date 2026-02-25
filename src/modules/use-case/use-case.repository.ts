import { Injectable } from '@nestjs/common';
import { UseCase } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from '../base-repository/base-repository';
import { UseCaseQueryDto } from './use-case.dto';


@Injectable()
export class UseCaseRepository extends BaseRepository<UseCase> {
  constructor(prisma: PrismaService) {
    super(prisma, 'useCase');
  }

  async findBySlug(slug: string): Promise<UseCase | null> {
    return this.prisma.useCase.findUnique({ where: { slug } });
  }

  async findByTitle(title: string): Promise<UseCase | null> {
    return this.prisma.useCase.findFirst({ where: { title } });
  }

  async findAllWithCount(query: UseCaseQueryDto = {}): Promise<UseCase[]> {
    const { search, skip = 0, take = 50 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.useCase.findMany({
      where,
      skip,
      take,
      orderBy: { title: 'asc' },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  async findByIdWithCount(id: string): Promise<UseCase | null> {
    return this.prisma.useCase.findUnique({
      where: { id },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  async findBySlugWithCount(slug: string): Promise<UseCase | null> {
    return this.prisma.useCase.findUnique({
      where: { slug },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }
}