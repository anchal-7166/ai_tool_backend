import { Injectable, Logger } from '@nestjs/common';
import { ISeeding } from '../seeding.interface';
import { PrismaService } from 'src/database/prisma.service';
import { PlatformType, TargetAudience, ToolStatus, PricingType } from '@prisma/client';

@Injectable()
export class ToolsSeed implements ISeeding {
  private readonly logger = new Logger(ToolsSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  async run(): Promise<void> {
    this.logger.log('🧹 Clearing existing tools and relations...');

    // Delete existing tool relations first to maintain referential integrity
    await this.prisma.favorite.deleteMany();
    await this.prisma.review.deleteMany();
    await this.prisma.toolCategory.deleteMany();
    await this.prisma.toolTag.deleteMany();
    await this.prisma.pricingPlan.deleteMany();
    await this.prisma.screenshot.deleteMany();
    await this.prisma.feature.deleteMany();
    await this.prisma.integration.deleteMany();
    await this.prisma.toolUseCase.deleteMany();
    await this.prisma.toolIndustry.deleteMany();
    await this.prisma.tool.deleteMany();

    this.logger.log('✅ Cleared old tools data.');

    // Ensure a seed user exists
    let seedUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!seedUser) {
      seedUser = await this.prisma.user.create({
        data: {
          email: 'admin@ai-directory.demo',
          username: 'aidirectory_admin',
          password: '$2b$10$demoHashPasswordForSeedUserOnly1234567890',
          firstName: 'AI Directory',
          lastName: 'Admin',
          role: 'ADMIN',
          isVerified: true,
        },
      });
    }

    // Fetch category and tag maps for linking
    const categoriesMap = new Map(
      (await this.prisma.category.findMany()).map((c) => [c.slug, c.id]),
    );

    const tagsMap = new Map(
      (await this.prisma.tag.findMany()).map((t) => [t.slug, t.id]),
    );

    const toolsData = [
      // ==================== 0. FEATURED EXAMPLE TOOL (With Video) ====================
      {
        name: 'OmniGen AI - Example Super Tool',
        slug: 'omnigen-ai-example-super-tool',
        tagline: 'The all-in-one AI powerhouse for coding, video, music, marketing & image generation',
        description: 'OmniGen AI is a complete demonstration example tool featuring multi-modal AI capabilities, YouTube video walkthroughs, high-resolution screenshot carousels, and multi-tier pricing plans.',
        longDescription: `OmniGen AI represents the next generation of multi-modal artificial intelligence. 
It combines autonomous code generation, 8K photorealistic image rendering, studio voice synthesis, and multi-channel marketing content creation into a single unified workspace.`,
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://omnigen-demo.example.app',
        demoUrl: 'https://sandbox.omnigen-demo.example.app',
        documentationUrl: 'https://docs.omnigen-demo.example.app',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'OmniGen v4 Multi-Modal Engine',
        searchKeywords: ['example', 'demo', 'all-in-one', 'coding', 'marketing', 'music', 'video', 'image', 'omnigen'],
        platformType: [PlatformType.WEB, PlatformType.DESKTOP_MAC, PlatformType.DESKTOP_WINDOWS, PlatformType.API],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.MARKETERS, TargetAudience.DESIGNERS, TargetAudience.BUSINESS_OWNERS],
        viewCount: 5420,
        clickCount: 3100,
        favoriteCount: 890,
        reviewCount: 64,
        averageRating: 5.0,
        categorySlugs: ['code-assistants', 'image-generation', 'video-generation', 'audio-music', 'marketing'],
        tagSlugs: ['developer-tools', 'image-generator', 'video-editor', 'marketing', 'social-media'],
        screenshots: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Community Free', price: 0, type: PricingType.FREE, description: 'Free forever for individual creators', features: ['100 AI credits per month', '720p Video generation'] },
          { name: 'Pro Creator', price: 29, type: PricingType.SUBSCRIPTION, description: 'Unleash full multi-modal power', features: ['5,000 AI credits per month', '4K Video & 8K Image generation'] },
        ],
        features: [
          'Autonomous multi-file code generation & refactoring',
          '8K Photorealistic image rendering & vector logo export',
          'Studio voice synthesis & AI music composition',
        ],
        integrations: ['GitHub', 'Figma', 'VS Code', 'Slack'],
      },

      // ==================== 1. CODING / DEVELOPMENT (5 tools) ====================
      {
        name: 'CodeNova AI',
        slug: 'codenova-ai',
        tagline: 'Autonomous AI pair-programmer for instant refactoring & test generation',
        description: 'CodeNova AI analyzes entire repositories to suggest clean architectural improvements, generate comprehensive unit tests, and streamline code reviews.',
        longDescription: `CodeNova AI is an advanced autonomous developer assistant designed to boost engineering productivity.`,
        logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://codenova-demo.app',
        demoUrl: 'https://demo.codenova-demo.app',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Claude 3.5 Sonnet',
        searchKeywords: ['coding', 'developer', 'refactoring', 'unit testing', 'typescript'],
        platformType: [PlatformType.WEB, PlatformType.CLI, PlatformType.DESKTOP_MAC],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.PRODUCT_MANAGERS],
        viewCount: 1420,
        clickCount: 890,
        favoriteCount: 342,
        reviewCount: 28,
        averageRating: 4.9,
        categorySlugs: ['code-assistants', 'productivity'],
        tagSlugs: ['cli-tool', 'developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Starter', price: 0, type: PricingType.FREE, description: 'For open-source & hobby developers', features: ['50 AI completions/day', 'Basic test generation'] },
        ],
        features: ['Automated unit testing', 'Multi-file refactoring'],
        integrations: ['GitHub', 'VS Code'],
      },
      {
        name: 'DevPulse Synth',
        slug: 'devpulse-synth',
        tagline: 'AI-powered schema & API boilerplate generator',
        description: 'Generate production-ready NestJS, GraphQL, and TypeScript endpoints from plain text specifications in seconds.',
        longDescription: `DevPulse Synth transforms plain English backend requirements into enterprise-ready code.`,
        logo: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://devpulse-demo.app',
        // NO videoUrl set (video section will be invisible)
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'GPT-4o',
        searchKeywords: ['backend', 'nestjs', 'api', 'graphql', 'prisma'],
        platformType: [PlatformType.WEB, PlatformType.API],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.BUSINESS_OWNERS],
        viewCount: 980,
        clickCount: 540,
        favoriteCount: 215,
        reviewCount: 19,
        averageRating: 4.8,
        categorySlugs: ['code-assistants'],
        tagSlugs: ['developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Pro Builder', price: 29, type: PricingType.SUBSCRIPTION, description: 'Full access to all stack generators', features: ['Unlimited API generation'] },
        ],
        features: ['NestJS endpoint generator', 'Prisma schema builder'],
        integrations: ['Postman', 'Prisma'],
      },
      {
        name: 'SyntaxForge',
        slug: 'syntaxforge',
        tagline: 'Instant multi-language code translation & legacy system migration',
        description: 'Migrate legacy Java, C++, and Python codebases into modern Rust and TypeScript with zero boilerplate overhead.',
        longDescription: `SyntaxForge specializes in cross-language code translation and modernization.`,
        logo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://syntaxforge-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Custom Code Llama',
        searchKeywords: ['migration', 'rust', 'typescript', 'java'],
        platformType: [PlatformType.CLI, PlatformType.DESKTOP_MAC],
        targetAudience: [TargetAudience.DEVELOPERS],
        viewCount: 1100,
        clickCount: 620,
        favoriteCount: 189,
        reviewCount: 14,
        averageRating: 4.7,
        categorySlugs: ['code-assistants', 'translation'],
        tagSlugs: ['cli-tool', 'developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Community Edition', price: 0, type: PricingType.FREE, description: 'Free for open source projects', features: ['Up to 10k lines of code/mo'] },
        ],
        features: ['Java to Rust migration', 'Python to TypeScript converter'],
        integrations: ['CLI'],
      },
      {
        name: 'BugSentinel AI',
        slug: 'bugsentinel-ai',
        tagline: 'Real-time security auditing and vulnerability fixing for Git repos',
        description: 'Scan pull requests for security vulnerabilities, memory leaks, and hardcoded secrets with instant automated fixes.',
        longDescription: `BugSentinel AI monitors your source repositories 24/7 to catch security flaws before deployment.`,
        logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://bugsentinel-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'GPT-4 Turbo',
        searchKeywords: ['security', 'auditing', 'git', 'devops'],
        platformType: [PlatformType.WEB, PlatformType.API],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.BUSINESS_OWNERS],
        viewCount: 1850,
        clickCount: 1120,
        favoriteCount: 410,
        reviewCount: 36,
        averageRating: 4.9,
        categorySlugs: ['code-assistants', 'productivity'],
        tagSlugs: ['developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Free Guard', price: 0, type: PricingType.FREE, description: 'For public repositories', features: ['Public repo scanning'] },
        ],
        features: ['OWASP vulnerability scanner', 'Automated patch PR generator'],
        integrations: ['GitHub'],
      },
      {
        name: 'GitMindCopilot',
        slug: 'gitmind-copilot',
        tagline: 'Context-aware documentation writer for code repositories',
        description: 'Automatically generates interactive API documentation, README files, and architecture diagrams from your source code.',
        longDescription: `GitMindCopilot keeps documentation synchronized with code changes automatically.`,
        logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://gitmind-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'Claude 3 Haiku',
        searchKeywords: ['documentation', 'readme', 'api docs'],
        platformType: [PlatformType.WEB, PlatformType.CLI],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.WRITERS],
        viewCount: 740,
        clickCount: 390,
        favoriteCount: 160,
        reviewCount: 11,
        averageRating: 4.6,
        categorySlugs: ['code-assistants', 'writing-tools'],
        tagSlugs: ['developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Open Access', price: 0, type: PricingType.FREE, description: 'Free forever for developers', features: ['Automatic README sync'] },
        ],
        features: ['Auto README generator', 'Mermaid diagram builder'],
        integrations: ['GitHub'],
      },

      // ==================== 2. MARKETING & COPYWRITING (4 tools) ====================
      {
        name: 'MarketFlow AI',
        slug: 'marketflow-ai',
        tagline: 'AI marketing strategist for multi-channel ad campaigns',
        description: 'MarketFlow creates hyper-targeted Google, Meta, and LinkedIn ad copy, A/B test variants, and audience personas in seconds.',
        longDescription: `MarketFlow AI acts as your dedicated digital marketing agency.`,
        logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://marketflow-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'GPT-4o',
        searchKeywords: ['marketing', 'advertising', 'copywriting'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS, TargetAudience.BUSINESS_OWNERS],
        viewCount: 1600,
        clickCount: 940,
        favoriteCount: 290,
        reviewCount: 24,
        averageRating: 4.8,
        categorySlugs: ['marketing', 'writing-tools'],
        tagSlugs: ['marketing'],
        screenshots: [
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Free Trial', price: 0, type: PricingType.FREEMIUM, description: 'Try 5 ad campaigns for free', features: ['5 Campaign generations'] },
        ],
        features: ['Multi-channel ad copy', 'A/B headline generator'],
        integrations: ['Google Ads'],
      },
      {
        name: 'CopyCraft Pro',
        slug: 'copycraft-pro',
        tagline: 'High-converting email sequence & landing page generator',
        description: 'Craft irresistible sales copy, cold outreach sequences, and landing page headlines tailored to your brand voice.',
        longDescription: `CopyCraft Pro streamlines high-converting copywriting for sales teams and founders.`,
        logo: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://copycraft-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'Claude 3.5 Sonnet',
        searchKeywords: ['copywriting', 'email marketing'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS, TargetAudience.WRITERS],
        viewCount: 1210,
        clickCount: 710,
        favoriteCount: 230,
        reviewCount: 18,
        averageRating: 4.7,
        categorySlugs: ['writing-tools', 'marketing'],
        tagSlugs: ['copywriting'],
        screenshots: [
          'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Pro Copywriter', price: 19, type: PricingType.SUBSCRIPTION, description: 'Unlimited sales copy creation', features: ['Custom brand voice training'] },
        ],
        features: ['Cold email sequence writer', 'Brand voice training'],
        integrations: ['HubSpot'],
      },
      {
        name: 'BrandVibe AI',
        slug: 'brandvibe-ai',
        tagline: 'Social media campaign generator and trend predictor',
        description: 'Predict viral social media trends and automatically create scheduled posts, hashtags, and visual quotes.',
        longDescription: `BrandVibe AI automates your social media calendar from ideation to publishing.`,
        logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://brandvibe-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'GPT-4o Mini',
        searchKeywords: ['social media', 'branding'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS],
        viewCount: 950,
        clickCount: 510,
        favoriteCount: 185,
        reviewCount: 15,
        averageRating: 4.6,
        categorySlugs: ['marketing'],
        tagSlugs: ['social-media'],
        screenshots: [
          'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Starter', price: 0, type: PricingType.FREE, description: '30 social posts per month', features: ['30 Post generations'] },
        ],
        features: ['Viral trend predictor', 'Social post scheduler'],
        integrations: ['Buffer'],
      },
      {
        name: 'RankMaster SEO',
        slug: 'rankmaster-seo',
        tagline: 'AI-driven SEO keyword research & article outline generator',
        description: 'Analyze search intent, competitor gaps, and generate rank-ready longform articles designed for search engines.',
        longDescription: `RankMaster SEO simplifies content marketing and organic traffic growth.`,
        logo: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://rankmaster-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Custom fine-tuned GPT-4',
        searchKeywords: ['seo', 'keyword research'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS, TargetAudience.WRITERS],
        viewCount: 1980,
        clickCount: 1250,
        favoriteCount: 375,
        reviewCount: 31,
        averageRating: 4.9,
        categorySlugs: ['seo-tools', 'marketing'],
        tagSlugs: ['seo-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Free Researcher', price: 0, type: PricingType.FREE, description: 'Free keyword intent lookup', features: ['10 Keyword audits/mo'] },
        ],
        features: ['Keyword intent auditor', 'Longform article generator'],
        integrations: ['WordPress'],
      },

      // ==================== 3. MUSIC & AUDIO (3 tools) ====================
      {
        name: 'SoundScape Synth',
        slug: 'soundscape-synth',
        tagline: 'Generative AI background music for creators and podcasts',
        description: 'Create royalty-free adaptive soundtracks, ambient atmospheres, and podcast background music tailored to any mood.',
        longDescription: `SoundScape Synth generates original, copyright-cleared musical compositions on demand.`,
        logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://soundscape-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'MusicGen AudioCraft',
        searchKeywords: ['music', 'audio', 'soundtrack'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.DESIGNERS, TargetAudience.WRITERS],
        viewCount: 1350,
        clickCount: 820,
        favoriteCount: 310,
        reviewCount: 22,
        averageRating: 4.8,
        categorySlugs: ['audio-music'],
        tagSlugs: ['audio-editing'],
        screenshots: [
          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Creator Free', price: 0, type: PricingType.FREE, description: 'Free MP3 tracks for personal use', features: ['3 Track exports/mo'] },
        ],
        features: ['Royalty-free music composer', 'Stem audio export'],
        integrations: ['Premiere Pro'],
      },
      {
        name: 'VocalMatrix AI',
        slug: 'vocalmatrix-ai',
        tagline: 'Studio-quality AI voiceover generator in 50+ languages',
        description: 'Convert script text into natural human voices with emotional tone control, pitch tuning, and dialect options.',
        longDescription: `VocalMatrix AI delivers hyper-realistic text-to-speech voiceovers for audiobooks and e-learning courses.`,
        logo: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://vocalmatrix-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'ElevenLabs Voice Engine',
        searchKeywords: ['voiceover', 'tts', 'audio'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS, TargetAudience.STUDENTS],
        viewCount: 1910,
        clickCount: 1180,
        favoriteCount: 420,
        reviewCount: 35,
        averageRating: 4.9,
        categorySlugs: ['audio-music', 'translation'],
        tagSlugs: ['voice-generator'],
        screenshots: [
          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Voice Studio', price: 24, type: PricingType.SUBSCRIPTION, description: '100,000 characters per month', features: ['50+ Ultra-realistic voices'] },
        ],
        features: ['Emotional tone voiceover', 'Custom voice cloning'],
        integrations: ['Descript'],
      },
      {
        name: 'BeatForge Studio',
        slug: 'beatforge-studio',
        tagline: 'AI drum pattern & melody composer for music producers',
        description: 'Generate MIDI drum loops, synth arpeggios, and chord progressions directly compatible with Ableton, Logic, and FL Studio.',
        longDescription: `BeatForge Studio is the ultimate AI copilot for music producers and beatmakers.`,
        logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://beatforge-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'Custom MIDI Transformer',
        searchKeywords: ['music production', 'midi'],
        platformType: [PlatformType.DESKTOP_MAC, PlatformType.DESKTOP_WINDOWS],
        targetAudience: [TargetAudience.DESIGNERS],
        viewCount: 810,
        clickCount: 440,
        favoriteCount: 195,
        reviewCount: 16,
        averageRating: 4.7,
        categorySlugs: ['audio-music'],
        tagSlugs: ['audio-editing'],
        screenshots: [
          'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Free Plugin', price: 0, type: PricingType.FREE, description: 'Free VST3/AU plugin', features: ['Unlimited MIDI drag & drop'] },
        ],
        features: ['MIDI pattern composer', 'VST3/AU DAW Plugin'],
        integrations: ['Ableton Live'],
      },

      // ==================== 4. IMAGE GENERATION & DESIGN (4 tools) ====================
      {
        name: 'VisionStudio AI',
        slug: 'visionstudio-ai',
        tagline: 'Ultra-realistic 8K image generator for designers & artists',
        description: 'Generate photorealistic portraits, concept art, and product photography with intuitive text prompts and style controls.',
        longDescription: `VisionStudio AI empowers digital artists, graphic designers, and agencies to create stunning visual assets in seconds.`,
        logo: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://visionstudio-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Stable Diffusion XL',
        searchKeywords: ['image generation', 'art'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.DESIGNERS, TargetAudience.MARKETERS],
        viewCount: 2450,
        clickCount: 1680,
        favoriteCount: 530,
        reviewCount: 45,
        averageRating: 4.9,
        categorySlugs: ['image-generation'],
        tagSlugs: ['image-generator'],
        screenshots: [
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Artist Free', price: 0, type: PricingType.FREE, description: '20 Image generations per day', features: ['20 Daily image credits'] },
        ],
        features: ['8K Photorealistic rendering', 'Inpainting & Outpainting'],
        integrations: ['Photoshop'],
      },
      {
        name: 'PixelRemix AI',
        slug: 'pixelremix-ai',
        tagline: 'Instant image background removal and object replacement',
        description: 'Remove backgrounds, replace foreground elements, and upscale images up to 16k resolution without quality loss.',
        longDescription: `PixelRemix AI is the fastest image touch-up tool for e-commerce stores and photographers.`,
        logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://pixelremix-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'Custom Vision Transformer',
        searchKeywords: ['editing', 'background removal'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.DESIGNERS],
        viewCount: 1300,
        clickCount: 780,
        favoriteCount: 280,
        reviewCount: 21,
        averageRating: 4.8,
        categorySlugs: ['image-generation'],
        tagSlugs: ['image-generator'],
        screenshots: [
          'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Free Magic', price: 0, type: PricingType.FREE, description: 'Free background removal', features: ['Unlimited HD removal'] },
        ],
        features: ['One-click background remover'],
        integrations: ['Shopify'],
      },
      {
        name: 'LogoGenius AI',
        slug: 'logogenius-ai',
        tagline: 'Vector brand logo & icon generator for startups',
        description: 'Create scalable SVG vector logos, icon sets, and brand kits using prompt-based generative vector design.',
        longDescription: `LogoGenius AI generates clean, professional vector logo files (.SVG, .AI, .PNG) tailored to startup identities.`,
        logo: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://logogenius-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'VectorDiffusion Engine',
        searchKeywords: ['logo', 'vector', 'svg'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.BUSINESS_OWNERS],
        viewCount: 1050,
        clickCount: 590,
        favoriteCount: 210,
        reviewCount: 17,
        averageRating: 4.7,
        categorySlugs: ['design-tools'],
        tagSlugs: ['graphic-design'],
        screenshots: [
          'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Brand Pack', price: 19, type: PricingType.FREEMIUM, description: 'Full vector brand kit download', features: ['SVG Vector files'] },
        ],
        features: ['SVG Vector logo generator'],
        integrations: ['Figma'],
      },
      {
        name: 'Artify3D',
        slug: 'artify3d',
        tagline: 'Convert 2D images and text into 3D mesh assets',
        description: 'Generate textured 3D models and OBJ/GLTF files from single 2D images or text prompts for game development.',
        longDescription: `Artify3D converts flat images or text descriptions into production-ready 3D game models with PBR textures.`,
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://artify3d-demo.app',
        // NO videoUrl set
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Tripo3D Engine',
        searchKeywords: ['3d', 'game dev'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.DEVELOPERS, TargetAudience.DESIGNERS],
        viewCount: 1480,
        clickCount: 880,
        favoriteCount: 340,
        reviewCount: 27,
        averageRating: 4.8,
        categorySlugs: ['design-tools'],
        tagSlugs: ['developer-tools'],
        screenshots: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Game Dev Pro', price: 35, type: PricingType.SUBSCRIPTION, description: 'Unlimited 3D mesh exports', features: ['OBJ, FBX exports'] },
        ],
        features: ['2D Image to 3D Mesh'],
        integrations: ['Unity'],
      },

      // ==================== 5. VIDEO GENERATION (3 tools with video) ====================
      {
        name: 'CineMotion AI',
        slug: 'cinemotion-ai',
        tagline: 'Text-to-video studio with cinematic camera controls',
        description: 'Generate high-definition video clips from text descriptions, complete with custom camera panning, zoom, and lighting.',
        longDescription: `CineMotion AI enables filmmakers and content creators to turn written scripts into 1080p photorealistic video scenes.`,
        logo: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://cinemotion-demo.app',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Sora Engine',
        searchKeywords: ['video', 'cinematic'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.DESIGNERS, TargetAudience.MARKETERS],
        viewCount: 2300,
        clickCount: 1540,
        favoriteCount: 490,
        reviewCount: 41,
        averageRating: 4.9,
        categorySlugs: ['video-generation'],
        tagSlugs: ['video-editor'],
        screenshots: [
          'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Director Pass', price: 49, type: PricingType.SUBSCRIPTION, description: 'For video creators', features: ['1080p HD video generation'] },
        ],
        features: ['Text-to-video generator'],
        integrations: ['Premiere Pro'],
      },
      {
        name: 'ClipShorts AI',
        slug: 'clipshorts-ai',
        tagline: 'Auto-cut long videos into viral TikTok & YouTube Shorts',
        description: 'Automatically extract highlight moments from long webinars and podcasts, add auto-captions, and format for vertical video.',
        longDescription: `ClipShorts AI analyzes long videos to detect engaging moments, key quotes, and laughter peaks.`,
        logo: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://clipshorts-demo.app',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: true,
        isVerified: true,
        aiModel: 'Whisper AI',
        searchKeywords: ['shorts', 'tiktok'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.MARKETERS],
        viewCount: 1720,
        clickCount: 1090,
        favoriteCount: 360,
        reviewCount: 30,
        averageRating: 4.8,
        categorySlugs: ['video-generation'],
        tagSlugs: ['video-editor'],
        screenshots: [
          'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Creator Standard', price: 18, type: PricingType.SUBSCRIPTION, description: '5 hours of video/mo', features: ['Auto animated captions'] },
        ],
        features: ['Auto animated captions'],
        integrations: ['YouTube'],
      },
      {
        name: 'AvatarMotion AI',
        slug: 'avatarmotion-ai',
        tagline: 'Photorealistic AI presenter avatars for training & explainer videos',
        description: 'Create professional video presentations featuring lifelike AI avatars speaking in multiple languages without filming.',
        longDescription: `AvatarMotion AI allows HR and training teams to produce corporate video presentations without studio equipment.`,
        logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        websiteUrl: 'https://avatarmotion-demo.app',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        status: ToolStatus.APPROVED,
        isPublished: true,
        isFeatured: false,
        isVerified: true,
        aiModel: 'HeyGen Synthesis',
        searchKeywords: ['avatars', 'explainer videos'],
        platformType: [PlatformType.WEB],
        targetAudience: [TargetAudience.HR_RECRUITERS],
        viewCount: 1190,
        clickCount: 680,
        favoriteCount: 275,
        reviewCount: 20,
        averageRating: 4.7,
        categorySlugs: ['video-generation'],
        tagSlugs: ['video-editor'],
        screenshots: [
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80',
        ],
        pricingPlans: [
          { name: 'Enterprise Presenter', price: 39, type: PricingType.SUBSCRIPTION, description: '30 Video minutes/mo', features: ['100+ Custom avatars'] },
        ],
        features: ['100+ Photorealistic AI avatars'],
        integrations: ['PowerPoint'],
      },
    ];

    this.logger.log(`🌱 Inserting ${toolsData.length} tools into database...`);

    for (const t of toolsData) {
      const {
        categorySlugs,
        tagSlugs,
        pricingPlans,
        screenshots,
        features,
        integrations,
        ...toolFields
      } = t;

      const createdTool = await this.prisma.tool.create({
        data: {
          ...toolFields,
          userId: seedUser.id,
          publishedAt: new Date(),
        },
      });

      // Link Categories
      for (const cSlug of categorySlugs) {
        const catId = categoriesMap.get(cSlug);
        if (catId) {
          await this.prisma.toolCategory.create({
            data: {
              toolId: createdTool.id,
              categoryId: catId,
            },
          });
        }
      }

      // Link Tags
      for (const tSlug of tagSlugs) {
        const tagId = tagsMap.get(tSlug);
        if (tagId) {
          await this.prisma.toolTag.create({
            data: {
              toolId: createdTool.id,
              tagId: tagId,
            },
          });
        }
      }

      // Link Pricing Plans
      for (const plan of pricingPlans) {
        await this.prisma.pricingPlan.create({
          data: {
            toolId: createdTool.id,
            name: plan.name,
            price: plan.price,
            type: plan.type,
            description: plan.description,
            features: plan.features,
          },
        });
      }

      // Link Screenshots
      if (screenshots && screenshots.length > 0) {
        let orderIndex = 1;
        for (const imgUrl of screenshots) {
          await this.prisma.screenshot.create({
            data: {
              toolId: createdTool.id,
              url: imgUrl,
              order: orderIndex++,
            },
          });
        }
      }

      // Link Features
      if (features && features.length > 0) {
        let orderIndex = 1;
        for (const featName of features) {
          await this.prisma.feature.create({
            data: {
              toolId: createdTool.id,
              name: featName,
              order: orderIndex++,
            },
          });
        }
      }

      // Link Integrations
      if (integrations && integrations.length > 0) {
        for (const intgName of integrations) {
          await this.prisma.integration.create({
            data: {
              toolId: createdTool.id,
              name: intgName,
            },
          });
        }
      }
    }

    const totalCount = await this.prisma.tool.count();
    this.logger.log(`🎉 Successfully seeded ${totalCount} tools cleanly!`);
  }
}
