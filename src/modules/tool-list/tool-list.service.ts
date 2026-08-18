import { Injectable, NotFoundException } from '@nestjs/common';
import { ToolsRepository } from './tool-list.repository';
import { PrismaService } from 'src/database/prisma.service';


export interface PaginationParams {
  page?: number;
  limit?: number;
}

@Injectable()
export class ToolsService {
  constructor(
    private readonly toolsRepo: ToolsRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get all published tools with pagination
   */
  async findAll(params?: PaginationParams) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      this.toolsRepo.findPublished({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.toolsRepo.countPublished(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tools,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get tool by slug with full details
   * Increments view count
   */
  async findBySlug(slug: string, trackView: boolean = true, context?: { userId?: string; ipAddress?: string }) {
    const tool = await this.toolsRepo.findBySlugWithDetails(slug);

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    // Only show published tools to public
    if (!tool.isPublished) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    // Track unique view in background (don't await)
    if (trackView) {
      this.recordUniqueView(tool.id, context).catch(() => {});
    }

    return tool;
  }

  /**
   * Get featured tools
   */
  async findFeatured(limit: number = 10) {
    return this.toolsRepo.findFeatured(limit);
  }

  /**
   * Get trending tools (by weekly views)
   */
  async findTrending(limit: number = 20) {
    return this.toolsRepo.findTrending(limit);
  }

  /**
   * Get top rated tools
   */
  async findTopRated(limit: number = 20) {
    return this.toolsRepo.findTopRated(limit);
  }

  /**
   * Get newly added tools
   */
  async findNew(limit: number = 20) {
    return this.toolsRepo.findNew(limit);
  }

  /**
   * Get similar tools
   */
  async findSimilar(slug: string, limit: number = 6) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    return this.toolsRepo.findSimilar(tool.id, limit);
  }


  async findToolById(id: string, context?: { userId?: string; ipAddress?: string }) {
    const tool = await this.prisma.tool.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with id "${id}" not found`);
    }

    // Track unique view in background
    this.recordUniqueView(tool.id, context).catch(() => {});

    return this.toolsRepo.findBySlugWithDetails(tool.slug);
  }


async likeUnlikeTool(toolId: string, userId: string) {
  const tool = await this.prisma.tool.findUnique({
    where: { id: toolId },
    select: { id: true },
  });

  if (!tool) {
    throw new NotFoundException(`Tool with id "${toolId}" not found`);
  }
  // Check if already favorited
  const existingFavorite = await this.prisma.favorite.findUnique({
    where: {
      userId_toolId: {
        userId,
        toolId,
      },
    },
  });

  if (existingFavorite) {
    await this.prisma.favorite.delete({
      where: {
        userId_toolId: {
          userId,
          toolId,
        },
      },
    });
    await this.prisma.tool.update({
      where: { id: toolId },
      data: {
        favoriteCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Removed from favorites', liked: false };
  } else {
    await this.prisma.favorite.create({
      data: {
        userId,
        toolId,
      },
    });

    // Increase count
    await this.prisma.tool.update({
      where: { id: toolId },
      data: {
        favoriteCount: {
          increment: 1,
        },
      },
    });

    return { message: 'Added to favorites', liked: true };
  }
}


  /**
   * Get tools by category
   */
  async findByCategory(categorySlug: string, params?: PaginationParams) {
    const limit = params?.limit || 20;
    const tools = await this.toolsRepo.findByCategory(categorySlug, limit);

    return {
      category: categorySlug,
      total: tools.length,
      data: tools,
    };
  }

  /**
   * Get tools by tag
   */
  async findByTag(tagSlug: string, params?: PaginationParams) {
    const limit = params?.limit || 20;
    const tools = await this.toolsRepo.findByTag(tagSlug, limit);

    return {
      tag: tagSlug,
      total: tools.length,
      data: tools,
    };
  }


  //************ UPDATE METHODS TO USE TOOL-REPOSITORY INSTEAD DIRECT USING PRISMA SERVICE*******************************  */

  /**
   * Track click-through to tool website
   */
  async trackClick(slug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug },
      select: { id: true, websiteUrl: true },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${slug}" not found`);
    }

    // Increment click count in background
    this.toolsRepo.incrementClickCount(tool.id).catch(() => {
      // Silently fail
    });

    return {
      url: tool.websiteUrl,
      message: 'Click tracked',
    };
  }

  /**
   * Get tool statistics
   */
  async getStats() {
    const [
      totalTools,
      publishedTools,
      featuredTools,
      verifiedTools,
      totalViews,
      totalReviews,
    ] = await Promise.all([
      this.prisma.tool.count(),
      this.prisma.tool.count({ where: { isPublished: true } }),
      this.prisma.tool.count({ where: { isFeatured: true, isPublished: true } }),
      this.prisma.tool.count({ where: { isVerified: true, isPublished: true } }),
      this.prisma.tool.aggregate({
        _sum: { viewCount: true },
        where: { isPublished: true },
      }),
      this.prisma.review.count(),
    ]);

    return {
      totalTools,
      publishedTools,
      featuredTools,
      verifiedTools,
      totalViews: totalViews._sum.viewCount || 0,
      totalReviews,
    };
  }

  /**
   * Record a unique view per user/IP within a 24-hour window.
   * If the user/IP has already viewed this tool in the last 24 hours, skip incrementing viewCount.
   */
  async recordUniqueView(toolId: string, context?: { userId?: string; ipAddress?: string }) {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const userId = context?.userId || null;
      const ipAddress = context?.ipAddress || null;

      // Build search filter for 24-hour window deduplication
      const whereCondition: any = {
        toolId,
        viewedAt: { gte: twentyFourHoursAgo },
      };

      if (userId) {
        whereCondition.userId = userId;
      } else if (ipAddress) {
        whereCondition.ipAddress = ipAddress;
      }

      // Check if user/IP already viewed this tool in the last 24h
      const existingView = await this.prisma.toolView.findFirst({
        where: whereCondition,
      });

      if (existingView) {
        return; // Deduplicated — view already counted within 24h window
      }

      // Record new unique view and increment metrics
      await Promise.all([
        this.prisma.toolView.create({
          data: {
            toolId,
            userId,
            ipAddress,
          },
        }),
        this.toolsRepo.incrementViewCount(toolId),
      ]);
    } catch (error) {
      // Silently fail for background analytics
    }
  }

 
  /**
 * Check if a user has already liked/favorited a tool
 */
async checkUserFavorite(toolId: string, userId: string): Promise<{ isFavorited: boolean }> {
  const tool = await this.prisma.tool.findUnique({
    where: { id: toolId },
    select: { id: true },
  });

  if (!tool) {
    throw new NotFoundException(`Tool with id "${toolId}" not found`);
  }

  const existingFavorite = await this.prisma.favorite.findUnique({
    where: {
      userId_toolId: {
        userId,
        toolId,
      },
    },
  });

  return { isFavorited: !!existingFavorite };
}

/**
 * 1. Get all PUBLISHED tools by the logged-in user
 */
async findPublishedByUser(userId: string, params?: PaginationParams) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const [tools, total] = await Promise.all([
    this.prisma.tool.findMany({
      where: {
        userId,
        isPublished: true,
        status: 'APPROVED',
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        pricingPlans: true,
        _count: { select: { reviews: true, favorites: true } },
      },
    }),
    this.prisma.tool.count({
      where: { userId, isPublished: true, status: 'APPROVED' },
    }),
  ]);

  return {
    data: tools,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * 3. Get all tools SAVED/FAVORITED by the logged-in user
 */
async findSavedByUser(userId: string, params?: PaginationParams) {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    this.prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tool: {
          include: {
            categories: { include: { category: true } },
            tags: { include: { tag: true } },
            pricingPlans: true,
            _count: { select: { reviews: true, favorites: true } },
          },
        },
      },
    }),
    this.prisma.favorite.count({ where: { userId } }),
  ]);

  return {
    data: favorites.map(f => ({ ...f.tool, savedAt: f.createdAt })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}


}