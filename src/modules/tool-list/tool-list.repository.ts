import { Injectable } from '@nestjs/common';
import { Tool, ToolStatus } from '@prisma/client';
import { BaseRepository } from '../base-repository/base-repository';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class ToolsRepository extends BaseRepository<Tool> {
  constructor(prisma: PrismaService) {
    super(prisma, 'tool');
  }

  
  /**
   * Find all published tools with relations
   */
  async findPublished(params?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }) {
    return this.prisma.tool.findMany({
      where: {
        // isPublished: true,
        status: ToolStatus.APPROVED,
      },
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy || { createdAt: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true, icon: true, color: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
          take: 10,
        },
        pricingPlans: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            currency: true,
            billingCycle: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Count published tools
   */
  async countPublished(): Promise<number> {
    return this.prisma.tool.count({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
      },
    });
  }

  /**
   * Find tool by slug with full details
   */
  async findBySlugWithDetails(slug: string) {
    return this.prisma.tool.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        useCases: {
          include: {
            useCase: true,
          },
        },
        industries: {
          include: {
            industry: true,
          },
        },
        pricingPlans: true,
        screenshots: {
          orderBy: { order: 'asc' },
        },
        integrations: true,
        features: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            bio: true,
          },
        },
      },
    });
  }

  /**
   * Get featured tools
   */
  async findFeatured(limit: number = 10) {
    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
        status: ToolStatus.APPROVED,
      },
      take: limit,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Get trending tools (by weekly views)
   */
  async findTrending(limit: number = 20) {
    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
      },
      take: limit,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Get top rated tools
   */
  async findTopRated(limit: number = 20) {
    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
        averageRating: { gte: 4.0 },
        reviewCount: { gte: 5 }, // At least 5 reviews
      },
      take: limit,
      orderBy: [
        { averageRating: 'desc' },
        { reviewCount: 'desc' },
      ],
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Get newly added tools (last 30 days)
   */
  async findNew(limit: number = 20) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
        publishedAt: { gte: thirtyDaysAgo },
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Find similar tools by category and tags
   */
  async findSimilar(toolId: string, limit: number = 6) {
    // First get the tool's categories and tags
    const tool = await this.prisma.tool.findUnique({
      where: { id: toolId },
      include: {
        categories: { select: { categoryId: true } },
        tags: { select: { tagId: true } },
      },
    });

    if (!tool) return [];

    const categoryIds = tool.categories.map((c) => c.categoryId);
    const tagIds = tool.tags.map((t) => t.tagId);

    // Find tools with overlapping categories or tags
    return this.prisma.tool.findMany({
      where: {
        id: { not: toolId },
        isPublished: true,
        status: ToolStatus.APPROVED,
        OR: [
          {
            categories: {
              some: {
                categoryId: { in: categoryIds },
              },
            },
          },
          {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
        ],
      },
      take: limit,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string) {
    return this.prisma.tool.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        weeklyViews: { increment: 1 },
        monthlyViews: { increment: 1 },
      },
    });
  }

  /**
   * Increment click count (when user clicks through to website)
   */
  async incrementClickCount(id: string) {
    return this.prisma.tool.update({
      where: { id },
      data: {
        clickCount: { increment: 1 },
      },
    });
  }

  /**
   * Get tools by category slug
   */
  async findByCategory(categorySlug: string, limit: number = 20) {
    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
        categories: {
          some: {
            category: {
              slug: categorySlug,
            },
          },
        },
      },
      take: limit,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }

  /**
   * Get tools by tag slug
   */
  async findByTag(tagSlug: string, limit: number = 20) {
    return this.prisma.tool.findMany({
      where: {
        isPublished: true,
        status: ToolStatus.APPROVED,
        tags: {
          some: {
            tag: {
              slug: tagSlug,
            },
          },
        },
      },
      take: limit,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: {
          include: {
            category: {
              select: { name: true, slug: true, icon: true },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: { name: true, slug: true },
            },
          },
          take: 5,
        },
        pricingPlans: {
          select: { name: true, type: true, price: true },
        },
      },
    });
  }


  


}