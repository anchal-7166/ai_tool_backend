import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from '../base-repository/base-repository';
import { CategoryQueryDto } from './catgories.dto';


@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaService) {
    super(prisma, 'category');
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { slug } });
  }

  async findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { name } });
  }

  /**
   * Find all categories with optional filters, including parent/children/toolCount.
   */
  async findAllWithRelations(query: CategoryQueryDto = {}): Promise<Category[]> {
    const { search, parentId, rootOnly, skip = 0, take = 50 } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (rootOnly) {
      where.parentId = null;
    }

    return this.prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        },
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  async findByIdWithRelations(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        },
        _count: { select: { tools: true } },
      },
    }) as any;
  }

  /**
   * Get the full category tree (root → children recursively).
   * Suitable for small/medium category sets.
   */
  async findTree(): Promise<Category[]> {
    const all = await this.prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { tools: true } } },
    });

    // Build in-memory tree
    const map = new Map<string, any>();
    all.forEach((c) => map.set(c.id, { ...c, children: [] }));

    const roots: any[] = [];
    map.forEach((node) => {
      if (node.parentId) {
        const parent = map.get(node.parentId);
        if (parent) parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}