import { Injectable, NotFoundException, BadRequestException, ForbiddenException, UseGuards } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwtguard';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review for a tool
   */
  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { toolSlug, ...reviewData } = createReviewDto;

    // Find tool by slug
    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${toolSlug}" not found`);
    }

    // Check if user already reviewed this tool
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId: tool.id,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this tool');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        ...reviewData,
        userId,
        toolId: tool.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Update tool's average rating
    await this.updateToolRating(tool.id);

    return review;
  }

  /**
   * Get all reviews for a tool
   */
  async findByToolSlug(toolSlug: string, page: number = 1, limit: number = 20) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${toolSlug}" not found`);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { toolId: tool.id },
        skip,
        take: limit,
        orderBy: [
          { isVerified: 'desc' },
          { isHelpful: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { toolId: tool.id } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user's review for a specific tool
   */
  async findUserReviewForTool(userId: string, toolSlug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${toolSlug}" not found`);
    }

    const review = await this.prisma.review.findUnique({
      where: {
        userId_toolId: {
          userId,
          toolId: tool.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Get all reviews by a user
   */
  async findByUser(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tool: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update a review
   */
  async update(reviewId: string, userId: string, updateReviewDto: UpdateReviewDto) {
    // Find review
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Update tool's average rating
    await this.updateToolRating(review.toolId);

    return updatedReview;
  }

  /**
   * Delete a review
   */
  async remove(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update tool's average rating
    await this.updateToolRating(review.toolId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        isHelpful: review.isHelpful + 1,
      },
    });
  }

  /**
   * Get review statistics for a tool
   */
  async getToolReviewStats(toolSlug: string) {
    const tool = await this.prisma.tool.findUnique({
      where: { slug: toolSlug },
    });

    if (!tool) {
      throw new NotFoundException(`Tool with slug "${toolSlug}" not found`);
    }

    const reviews = await this.prisma.review.findMany({
      where: { toolId: tool.id },
      select: { rating: true },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  /**
   * Private: Update tool's average rating and review count
   */
  private async updateToolRating(toolId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { toolId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;


    // await this.prisma.tool.update({
    //   where: { id: toolId },
    //   data: {
    //     averageRating: Math.round(averageRating * 10) / 10,
    //     totalReviews,
    //   },
    // });
  }
}