import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // ==================== APP ====================
  app: {
    name: process.env.APP_NAME || 'AI Tools Marketplace',
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
  },

  // ==================== JWT ====================
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
      ? isNaN(Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION))
        ? process.env.JWT_ACCESS_TOKEN_EXPIRATION
        : Number(process.env.JWT_ACCESS_TOKEN_EXPIRATION)
      : '15m',

    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION
      ? isNaN(Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION))
        ? process.env.JWT_REFRESH_TOKEN_EXPIRATION
        : Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION)
      : '7d',
  },

  // ==================== EMAIL ====================
  email: {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || '"AI Tools Marketplace" <noreply@aitoolsmarket.com>',
  },

  // ==================== FILE UPLOAD ====================
  upload: {
    // Storage type: 'local' | 's3' | 'cloudinary'
    provider: process.env.UPLOAD_PROVIDER || 'local',
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB) || 5,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    allowedVideoTypes: ['video/mp4', 'video/webm'],

    // Local storage (development)
    localUploadPath: process.env.LOCAL_UPLOAD_PATH || './uploads',

    // AWS S3
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET,
      cdnUrl: process.env.AWS_CDN_URL,
    },

    // Cloudinary
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER || 'ai-tools-marketplace',
    },
  },

  // ==================== REDIS (Caching) ====================
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD,

    // Cache TTL (Time To Live) in seconds
    ttl: {
      tools: Number(process.env.CACHE_TOOLS_TTL) || 300,          // 5 min
      categories: Number(process.env.CACHE_CATEGORIES_TTL) || 600, // 10 min
      search: Number(process.env.CACHE_SEARCH_TTL) || 60,          // 1 min
      trending: Number(process.env.CACHE_TRENDING_TTL) || 300,     // 5 min
      user: Number(process.env.CACHE_USER_TTL) || 120,             // 2 min
    },
  },

  // ==================== SEARCH ====================
  search: {
    // 'prisma' | 'meilisearch' | 'elasticsearch' | 'algolia'
    provider: process.env.SEARCH_PROVIDER || 'prisma',
    // MeiliSearch
    meilisearch: {
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_API_KEY,
    },
    // Elasticsearch
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
    // Algolia
    algolia: {
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
      searchKey: process.env.ALGOLIA_SEARCH_KEY,
      indexName: process.env.ALGOLIA_INDEX_NAME || 'tools',
    },

    // Search limits
    defaultLimit: Number(process.env.SEARCH_DEFAULT_LIMIT) || 20,
    maxLimit: Number(process.env.SEARCH_MAX_LIMIT) || 100,
  },

  // ==================== PAGINATION ====================
  pagination: {
    defaultPage: 1,
    defaultLimit: Number(process.env.DEFAULT_PAGE_LIMIT) || 20,
    maxLimit: Number(process.env.MAX_PAGE_LIMIT) || 100,
  },

  // ==================== RATE LIMITING ====================
  rateLimit: {
    ttl: Number(process.env.RATE_LIMIT_TTL) || 60,             // Window in seconds
    limit: Number(process.env.RATE_LIMIT_MAX) || 100,          // Max requests per window
    authLimit: Number(process.env.RATE_LIMIT_AUTH) || 10,      // Auth endpoints (stricter)
    searchLimit: Number(process.env.RATE_LIMIT_SEARCH) || 30,  // Search endpoints
  },

  // ==================== SECURITY ====================
  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:5000'],
  },

  // ==================== TOOLS ====================
  tools: {
    featuredLimit: Number(process.env.FEATURED_TOOLS_LIMIT) || 12,
    trendingLimit: Number(process.env.TRENDING_TOOLS_LIMIT) || 20,
    // Reset weekly views every Monday (cron expression)
    weeklyViewsResetCron: process.env.WEEKLY_VIEWS_RESET_CRON || '0 0 * * 1',
  },

  // ==================== SUBMISSIONS ====================
  submissions: {
    // How many tools a creator can submit per day
    dailyLimit: Number(process.env.SUBMISSION_DAILY_LIMIT) || 3,
  },
}));