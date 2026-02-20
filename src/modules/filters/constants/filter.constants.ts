export const FILTER_CONSTANTS = {
  ORDER: {
    ASCENDING: "asc",
    DESCENDING: "desc",
    DEFAULT_SORT_ORDER: "desc",
    ORDER_LIST: () => ["asc", "desc"] as const,
  },

  OPERATORS: {
    IN: "in",                // Array contains any of these values
    CONTAINS: "contains",    // String contains (case-insensitive)
    EQUALS: "equals",        // Exact match
    GTE: "gte",             // Greater than or equal (for numbers/dates)
    LTE: "lte",             // Less than or equal
    BETWEEN: "between",      // Number/date range
    ALL: () => ["in", "contains", "equals", "gte", "lte", "between"],
  },

  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  ENTITIES: {
    TOOLS: "tools",
    USERS: "users",
    ALL: () => ["tools", "users"],
  },

  // Tool-specific filter paths
  TOOL_FILTERS: {
    NAME: "name",
    SLUG: "slug",
    TAGLINE: "tagline",
    DESCRIPTION: "description",
    AI_MODEL: "aiModel",
    PLATFORM_TYPE: "platformType",
    TARGET_AUDIENCE: "targetAudience",
    STATUS: "status",
    IS_PUBLISHED: "isPublished",
    IS_FEATURED: "isFeatured",
    IS_VERIFIED: "isVerified",
    AVERAGE_RATING: "averageRating",
    PRICE_TYPE: "pricingPlans.type",
    CATEGORY_SLUG: "categories.category.slug",
    TAG_SLUG: "tags.tag.slug",
    USE_CASE_SLUG: "useCases.useCase.slug",
    INDUSTRY_SLUG: "industries.industry.slug",
  },
};

export const FILTER_ENTITIES = {
  TOOLS: "tools",
  USERS: "users",
};