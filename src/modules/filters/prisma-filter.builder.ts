import { BadRequestException } from '@nestjs/common';
import { IndividualFilterObject } from './filter-query/filter-query';
import { FILTER_CONSTANTS } from './constants/filter.constants';


export class PrismaFilterBuilder {
  /**
   * Convert filter objects to Prisma where clause
   * 
   * Example input:
   * { op: "in", path: "platformType", value: ["WEB", "API"] }
   * 
   * Example output:
   * { platformType: { hasSome: ["WEB", "API"] } }
   */
  static buildWhereClause(filters: IndividualFilterObject[]): any {
    let where: any = {};

    for (const filter of filters) {
      const condition = this.buildSingleCondition(filter);
      where = this.mergeConditions(where, condition);
    }

    return where;
  }

  /**
   * Build a single Prisma condition from a filter object
   */
  private static buildSingleCondition(filter: IndividualFilterObject): any {
    const { op, path, value } = filter;

    // Handle nested paths (e.g., "categories.category.slug")
    const pathParts = path.split('.');
    
    switch (op) {
      case FILTER_CONSTANTS.OPERATORS.IN:
        return this.buildNestedPath(pathParts, this.buildInCondition(value, pathParts[pathParts.length - 1]));

      case FILTER_CONSTANTS.OPERATORS.CONTAINS:
        return this.buildNestedPath(pathParts, { contains: value, mode: 'insensitive' });

      case FILTER_CONSTANTS.OPERATORS.EQUALS:
        return this.buildNestedPath(pathParts, { equals: value });

      case FILTER_CONSTANTS.OPERATORS.GTE:
        return this.buildNestedPath(pathParts, { gte: value });

      case FILTER_CONSTANTS.OPERATORS.LTE:
        return this.buildNestedPath(pathParts, { lte: value });

      case FILTER_CONSTANTS.OPERATORS.BETWEEN:
        if (typeof value !== 'object' || !('start' in value) || !('end' in value)) {
          throw new BadRequestException('Between operator requires {start, end} object');
        }
        return this.buildNestedPath(pathParts, { gte: value.start, lte: value.end });

      default:
        throw new BadRequestException(`Invalid operator: ${op}`);
    }
  }

  /**
   * Build IN condition based on field type
   * For Prisma arrays (platformType[], targetAudience[]) use hasSome
   * For relation filters use some
   */
  private static buildInCondition(value: any, fieldName: string): any {
    if (!Array.isArray(value)) {
      throw new BadRequestException('IN operator requires array value');
    }

    // These are Prisma array fields — use hasSome
    const arrayFields = ['platformType', 'targetAudience', 'searchKeywords'];
    
    if (arrayFields.includes(fieldName)) {
      return { hasSome: value };
    }

    // For relations, use 'in' for scalar fields or 'some' for nested
    return { in: value };
  }

  /**
   * Build nested path for Prisma relations
   * Example: ["categories", "category", "slug"] → { categories: { some: { category: { slug: {...} } } } }
   */
  private static buildNestedPath(parts: string[], condition: any): any {
    if (parts.length === 1) {
      return { [parts[0]]: condition };
    }

    // Build from the end backwards
    let result = { [parts[parts.length - 1]]: condition };

    for (let i = parts.length - 2; i >= 0; i--) {
      // Use 'some' for relation arrays (categories, tags, useCases, industries)
      const relationArrays = ['categories', 'tags', 'useCases', 'industries', 'pricingPlans'];
      
      if (relationArrays.includes(parts[i])) {
        result = { [parts[i]]: { some: result } };
      } else {
        result = { [parts[i]]: result };
      }
    }

    return result;
  }

  /**
   * Merge multiple where conditions with AND logic
   */
  private static mergeConditions(existing: any, newCondition: any): any {
    if (Object.keys(existing).length === 0) {
      return newCondition;
    }

    // If same key exists, wrap in AND array
    const existingKeys = Object.keys(existing);
    const newKeys = Object.keys(newCondition);
    const overlap = existingKeys.filter(k => newKeys.includes(k));

    if (overlap.length > 0) {
      return { AND: [existing, newCondition] };
    }

    // No overlap — simple merge
    return { ...existing, ...newCondition };
  }

  /**
   * Build Prisma orderBy from FilterOrderObject
   */
  static buildOrderBy(sort?: { orderBy: string; order: 'asc' | 'desc' }): any {
    if (!sort) return undefined;
    return { [sort.orderBy]: sort.order };
  }

  /**
   * Build pagination object
   */
  static buildPagination(page: number, limit: number): { skip: number; take: number } {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), FILTER_CONSTANTS.PAGINATION.MAX_LIMIT);
    
    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    };
  }
}