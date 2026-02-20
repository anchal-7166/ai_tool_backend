import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ToolsService } from './tool-list.service';

@ApiTags('Tools')
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // ==================== LIST ENDPOINTS ====================

  @Get()
  @ApiOperation({ summary: 'Get all published tools with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns paginated list of tools' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findAll({ page, limit });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured tools' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Returns featured tools' })
  async findFeatured(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findFeatured(limit);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending tools (by weekly views)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns trending tools' })
  async findTrending(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findTrending(limit);
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated tools (4+ stars, 5+ reviews)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns top rated tools' })
  async findTopRated(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findTopRated(limit);
  }

  @Get('new')
  @ApiOperation({ summary: 'Get newly added tools (last 30 days)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns newly added tools' })
  async findNew(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findNew(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Returns platform stats' })
  async getStats() {
    return this.toolsService.getStats();
  }

  // ==================== CATEGORY & TAG FILTERS ====================

  @Get('category/:slug')
  @ApiOperation({ summary: 'Get tools by category' })
  @ApiParam({ name: 'slug', example: 'chatbots' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns tools in category' })
  async findByCategory(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findByCategory(slug, { limit });
  }

  @Get('tag/:slug')
  @ApiOperation({ summary: 'Get tools by tag' })
  @ApiParam({ name: 'slug', example: 'gpt-4' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Returns tools with tag' })
  async findByTag(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findByTag(slug, { limit });
  }

  // ==================== SINGLE TOOL ENDPOINTS ====================

  @Get(':slug')
  @ApiOperation({ summary: 'Get tool by slug with full details' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiResponse({ status: 200, description: 'Returns tool details' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async findOne(@Param('slug') slug: string) {
    return this.toolsService.findBySlug(slug);
  }

  @Get(':slug/similar')
  @ApiOperation({ summary: 'Get similar tools based on categories and tags' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 6 })
  @ApiResponse({ status: 200, description: 'Returns similar tools' })
  async findSimilar(
    @Param('slug') slug: string,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return this.toolsService.findSimilar(slug, limit);
  }

  // ==================== TRACKING ENDPOINTS ====================

  @Post(':slug/click')
  @ApiOperation({ summary: 'Track click-through to tool website' })
  @ApiParam({ name: 'slug', example: 'chatgpt' })
  @ApiResponse({ status: 200, description: 'Click tracked, returns website URL' })
  async trackClick(@Param('slug') slug: string) {
    return this.toolsService.trackClick(slug);
  }
}