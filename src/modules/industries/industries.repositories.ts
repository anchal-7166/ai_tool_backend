import { Injectable } from '@nestjs/common';
import { Industry } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from '../base-repository/base-repository';
import { IndustryQueryDto } from './industries.dto';


@Injectable()
export class IndustryRepository extends BaseRepository<Industry> {
  constructor(prisma: PrismaService) {
    super(prisma, 'industry');
  }

  async findBySlug(slug: string): Promise<Industry | null> {
    return this.prisma.industry.findUnique({ where: { slug } });
  }

  async findByName(name: string): Promise<Industry | null> {
    return this.prisma.industry.findFirst({ where: { name } });
  }

  async findAllWithCount(query: IndustryQueryDto = {}): Promise<Industry[]> {
    const { search, skip = 0, take = 50 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.industry.findMany({
      where,
      skip,
      take,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  async findByIdWithCount(id: string): Promise<Industry | null> {
    return this.prisma.industry.findUnique({
      where: { id },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  async findBySlugWithCount(slug: string): Promise<Industry | null> {
    return this.prisma.industry.findUnique({
      where: { slug },
      include: {
        _count: { select: { tools: true } },
      },
    }) as any;
  }
}