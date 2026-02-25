// src/modules/reviews/reviews.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './review.service';
import { JwtAuthGuard } from '../auth/jwtguard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ==================== CREATE REVIEW ====================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a tool (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'You have already reviewed this tool' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  // ==================== GET REVIEWS ====================

  @Get('tool/:slug')
  @ApiOperation({ summary: 'Get all reviews for a tool' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns paginated reviews' })
  async findByToolSlug(
    @Param('slug') slug: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.findByToolSlug(slug, page, limit);
  }

  @Get('tool/:slug/stats')
  @ApiOperation({ summary: 'Get review statistics for a tool' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiResponse({ status: 200, description: 'Returns review statistics' })
  async getToolStats(@Param('slug') slug: string) {
    return this.reviewsService.getToolReviewStats(slug);
  }

  @Get('tool/:slug/my-review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get your review for a specific tool' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiResponse({ status: 200, description: 'Returns user review or null' })
  async findUserReviewForTool(@Request() req, @Param('slug') slug: string) {
    return this.reviewsService.findUserReviewForTool(req.user.id, slug);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all your reviews' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns user reviews' })
  async findMyReviews(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewsService.findByUser(req.user.id, page, limit);
  }

  // ==================== UPDATE REVIEW ====================

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'You can only update your own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.user.id, updateReviewDto);
  }

  // ==================== DELETE REVIEW ====================

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete your review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'You can only delete your own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.userId);
  }

  // ==================== MARK HELPFUL ====================

  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a review as helpful' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review marked as helpful' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(id);
  }
}