import { Injectable } from '@nestjs/common';
import { Tag } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from '../base-repository/base-repository';
import { TagQueryDto, TagSortBy } from './tags.dto';


@Injectable()
export class TagRepository extends BaseRepository<Tag> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tag');
  }

  async findBySlug(slug: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({ where: { slug } });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.prisma.tag.findUnique({ where: { name } });
  }

  async findAllWithQuery(query: TagQueryDto = {}): Promise<Tag[]> {
    const { search, sortBy = TagSortBy.USAGE_COUNT, skip = 0, take = 50 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy =
      sortBy === TagSortBy.USAGE_COUNT
        ? { usageCount: 'desc' as const }
        : sortBy === TagSortBy.CREATED_AT
          ? { createdAt: 'desc' as const }
          : { name: 'asc' as const };

    return this.prisma.tag.findMany({ where, skip, take, orderBy });
  }

  async findPopular(limit = 20): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: { usageCount: { gt: 0 } },
      orderBy: { usageCount: 'desc' },
      take: limit,
    });
  }

  async incrementUsageCount(id: string): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });
  }

  async decrementUsageCount(id: string): Promise<Tag> {
    return this.prisma.tag.update({
      where: { id },
      data: { usageCount: { decrement: 1 } },
    });
  }
}