import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { FILTER_CONSTANTS } from './constants/filter.constants';
import { FilterQueryObject } from './filter-query/filter-query';
import { PrismaFilterBuilder } from './prisma-filter.builder';
import { GlobalSearchQueryDto } from './dto/global-search-query.dto';


export interface FilterMetadata {
  filters: {
    op: string;
    path: string;
    title: string;
    type: string;
    values?: any[];
  }[];
}

@Injectable()
export class ToolsFilterService {
  private readonly logger = new Logger(ToolsFilterService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available filters for tools entity
   * Frontend uses this to build the filter UI
   */
  async getFilters(): Promise<FilterMetadata> {
    return {
      filters: [
        // Text search filters
        { op: FILTER_CONSTANTS.OPERATORS.CONTAINS, path: 'name',        title: 'Tool Name',    type: 'text' },
        { op: FILTER_CONSTANTS.OPERATORS.CONTAINS, path: 'tagline',     title: 'Tagline',      type: 'text' },
        { op: FILTER_CONSTANTS.OPERATORS.CONTAINS, path: 'description', title: 'Description',  type: 'text' },
        { op: FILTER_CONSTANTS.OPERATORS.CONTAINS, path: 'aiModel',     title: 'AI Model',     type: 'text' },

        // Enum/Array filters
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'platformType',    title: 'Platform Type',   type: 'enum', values: await this.getPlatformTypes() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'targetAudience',  title: 'Target Audience', type: 'enum', values: await this.getTargetAudiences() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'status',          title: 'Status',          type: 'enum', values: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] },

        // Boolean filters
        { op: FILTER_CONSTANTS.OPERATORS.EQUALS, path: 'isPublished', title: 'Published', type: 'boolean' },
        { op: FILTER_CONSTANTS.OPERATORS.EQUALS, path: 'isFeatured',  title: 'Featured',  type: 'boolean' },
        { op: FILTER_CONSTANTS.OPERATORS.EQUALS, path: 'isVerified',  title: 'Verified',  type: 'boolean' },

        // Number range filters
        { op: FILTER_CONSTANTS.OPERATORS.GTE,     path: 'averageRating', title: 'Min Rating',     type: 'number' },
        { op: FILTER_CONSTANTS.OPERATORS.BETWEEN, path: 'averageRating', title: 'Rating Range',   type: 'range' },
        { op: FILTER_CONSTANTS.OPERATORS.GTE,     path: 'viewCount',     title: 'Min View Count', type: 'number' },

        // Relation filters
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'categories.category.slug', title: 'Categories', type: 'relation', values: await this.getCategorySlugs() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'tags.tag.slug',           title: 'Tags',       type: 'relation', values: await this.getTagSlugs() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'useCases.useCase.slug',   title: 'Use Cases',  type: 'relation', values: await this.getUseCaseSlugs() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'industries.industry.slug', title: 'Industries', type: 'relation', values: await this.getIndustrySlugs() },
        { op: FILTER_CONSTANTS.OPERATORS.IN, path: 'pricingPlans.type',       title: 'Pricing Type', type: 'relation', values: ['FREE', 'FREEMIUM', 'PAID', 'SUBSCRIPTION', 'ONE_TIME', 'USAGE_BASED', 'CUSTOM'] },
      ],
    };
  }

  /**
   * Apply filters and return tools with pagination
   */
  async findMany(filterQuery: FilterQueryObject) {
    // Apply defaults for undefined values
    const page = filterQuery.page ?? FILTER_CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = filterQuery.limit ?? FILTER_CONSTANTS.PAGINATION.DEFAULT_LIMIT;

    const where = PrismaFilterBuilder.buildWhereClause(filterQuery.filters);
    const orderBy = PrismaFilterBuilder.buildOrderBy(filterQuery.sort);
    const pagination = PrismaFilterBuilder.buildPagination(page, limit);

    this.logger.log(`Prisma WHERE: ${JSON.stringify(where, null, 2)}`);

    const [data, total] = await Promise.all([
      this.prisma.tool.findMany({
        where,
        orderBy,
        ...pagination,
        include: {
          categories: { include: { category: true } },
          tags:       { include: { tag: true } },
          pricingPlans: true,
          user: { select: { id: true, username: true, email: true } },
        },
      }),
      this.prisma.tool.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
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
   * Global search across tools
   * Searches in name, tagline, description, searchKeywords, aiModel
   */
  async globalSearch(query: GlobalSearchQueryDto) {
    const { prompt, all, name, tagline, description, aiModel, ...filters } = query;
   
    // Build text search conditions
    const textConditions: any[] = [];

    if (all || (!name && !tagline && !description && !aiModel)) {
      // Search all text fields
      textConditions.push(
        { name:           { contains: prompt, mode: 'insensitive' } },
        { tagline:        { contains: prompt, mode: 'insensitive' } },
        { description:    { contains: prompt, mode: 'insensitive' } },
        { aiModel:        { contains: prompt, mode: 'insensitive' } },
        { searchKeywords: { has: prompt } },
      );
    } else {
      // Search specific fields
      if (name)        textConditions.push({ name:        { contains: prompt, mode: 'insensitive' } });
      if (tagline)     textConditions.push({ tagline:     { contains: prompt, mode: 'insensitive' } });
      if (description) textConditions.push({ description: { contains: prompt, mode: 'insensitive' } });
      if (aiModel)     textConditions.push({ aiModel:     { contains: prompt, mode: 'insensitive' } });
    }

    // Build additional filters
    const additionalFilters: any = {};

    if (filters.platformType?.length) {
      additionalFilters.platformType = { hasSome: filters.platformType };
    }

    if (filters.targetAudience?.length) {
      additionalFilters.targetAudience = { hasSome: filters.targetAudience };
    }

    if (filters.categories?.length) {
      additionalFilters.categories = {
        some: { category: { slug: { in: filters.categories } } },
      };
    }

    if (filters.tags?.length) {
      additionalFilters.tags = {
        some: { tag: { slug: { in: filters.tags } } },
      };
    }

    if (filters.status) {
      additionalFilters.status = filters.status;
    }

    if (filters.isPublished !== undefined) {
      additionalFilters.isPublished = filters.isPublished;
    }

    if (filters.isFeatured !== undefined) {
      additionalFilters.isFeatured = filters.isFeatured;
    }

    if (filters.isVerified !== undefined) {
      additionalFilters.isVerified = filters.isVerified;
    }

    // Combine text search with additional filters
    const where: any = {
      OR: textConditions,
      ...additionalFilters,
    };

    const tools = await this.prisma.tool.findMany({
      where,
      take: 20,
      orderBy: { weeklyViews: 'desc' },
      include: {
        categories: { include: { category: { select: { name: true, slug: true, icon: true } } } },
        tags:       { include: { tag: { select: { name: true, slug: true } } }, take: 5 },
        pricingPlans: { select: { name: true, type: true, price: true } },
        user: { select: { username: true } },
      },
    });

    return {
      total: tools.length,
      query: prompt,
      results: tools,
    };
  }


  private async getPlatformTypes() {
    return ['WEB', 'MOBILE_IOS', 'MOBILE_ANDROID', 'DESKTOP_MAC', 'DESKTOP_WINDOWS', 'DESKTOP_LINUX', 'API', 'CLI', 'BROWSER_EXTENSION'];
  }

  private async getTargetAudiences() {
    return ['DEVELOPERS', 'MARKETERS', 'DESIGNERS', 'WRITERS', 'SALES_TEAMS', 'CUSTOMER_SUPPORT', 'DATA_ANALYSTS', 'PRODUCT_MANAGERS', 'STUDENTS', 'RESEARCHERS', 'BUSINESS_OWNERS', 'HR_RECRUITERS'];
  }

  private async getCategorySlugs() {
    const categories = await this.prisma.category.findMany({ select: { slug: true } });
    return categories.map(c => c.slug);
  }

  private async getTagSlugs() {
    const tags = await this.prisma.tag.findMany({ select: { slug: true }, take: 50, orderBy: { usageCount: 'desc' } });
    return tags.map(t => t.slug);
  }

  private async getUseCaseSlugs() {
    const useCases = await this.prisma.useCase.findMany({ select: { slug: true } });
    return useCases.map(u => u.slug);
  }

  private async getIndustrySlugs() {
    const industries = await this.prisma.industry.findMany({ select: { slug: true } });
    return industries.map(i => i.slug);
  }
}