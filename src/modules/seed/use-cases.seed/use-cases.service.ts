import { Injectable, Logger } from '@nestjs/common';
import { ISeeding } from '../seeding.interface';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class UseCasesSeed implements ISeeding {
  private readonly logger = new Logger(UseCasesSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly useCases = [
    // Writing
    { id: 'uc-00000-0000-0000-000000000001', title: 'Generate Blog Posts',         slug: 'generate-blog-posts',         description: 'Create SEO-optimized blog content from topics',       icon: '✍️' },
    { id: 'uc-00000-0000-0000-000000000002', title: 'Create Product Descriptions', slug: 'create-product-descriptions', description: 'Write compelling product descriptions for e-commerce', icon: '🛒' },
    { id: 'uc-00000-0000-0000-000000000003', title: 'Write Marketing Copy',        slug: 'write-marketing-copy',        description: 'Create ads, email campaigns and landing page copy',    icon: '📣' },
    { id: 'uc-00000-0000-0000-000000000004', title: 'Summarize Articles',          slug: 'summarize-articles',          description: 'Condense long articles into key points',               icon: '📝' },
    { id: 'uc-00000-0000-0000-000000000005', title: 'Proofread & Edit',            slug: 'proofread-edit',              description: 'Check grammar and improve writing quality',            icon: '✅' },
    { id: 'uc-00000-0000-0000-000000000006', title: 'Write Social Media Posts',    slug: 'write-social-media-posts',    description: 'Generate posts for Twitter, LinkedIn, Instagram',      icon: '📱' },
    { id: 'uc-00000-0000-0000-000000000007', title: 'Translate Content',           slug: 'translate-content',           description: 'Translate text into multiple languages',               icon: '🌍' },
    // Code
    { id: 'uc-00000-0000-0000-000000000008', title: 'Generate Code',               slug: 'generate-code',               description: 'Write code from natural language descriptions',         icon: '💻' },
    { id: 'uc-00000-0000-0000-000000000009', title: 'Debug Code',                  slug: 'debug-code',                  description: 'Find and fix bugs in existing code',                   icon: '🐛' },
    { id: 'uc-00000-0000-0000-000000000010', title: 'Code Review',                 slug: 'code-review',                 description: 'Review code for quality and best practices',           icon: '🔍' },
    { id: 'uc-00000-0000-0000-000000000011', title: 'Write Documentation',         slug: 'write-documentation',         description: 'Generate technical docs and README files',             icon: '📖' },
    // Images
    { id: 'uc-00000-0000-0000-000000000012', title: 'Generate Images',             slug: 'generate-images',             description: 'Create images from text descriptions',                 icon: '🎨' },
    { id: 'uc-00000-0000-0000-000000000013', title: 'Edit Images',                 slug: 'edit-images',                 description: 'Modify and enhance existing images',                   icon: '🖼️' },
    { id: 'uc-00000-0000-0000-000000000014', title: 'Remove Background',           slug: 'remove-background',           description: 'Automatically remove image backgrounds',               icon: '✂️' },
    { id: 'uc-00000-0000-0000-000000000015', title: 'Upscale Images',              slug: 'upscale-images',              description: 'Increase image resolution with AI',                    icon: '🔬' },
    // Data
    { id: 'uc-00000-0000-0000-000000000016', title: 'Analyze Data',                slug: 'analyze-data',                description: 'Extract insights and patterns from datasets',          icon: '📊' },
    { id: 'uc-00000-0000-0000-000000000017', title: 'Generate Reports',            slug: 'generate-reports',            description: 'Create automated reports from raw data',               icon: '📋' },
    // Audio / Video
    { id: 'uc-00000-0000-0000-000000000018', title: 'Generate Voice',              slug: 'generate-voice',              description: 'Convert text to natural-sounding speech',              icon: '🎙️' },
    { id: 'uc-00000-0000-0000-000000000019', title: 'Transcribe Audio',            slug: 'transcribe-audio',            description: 'Convert audio and video to text',                      icon: '🎧' },
    { id: 'uc-00000-0000-0000-000000000020', title: 'Generate Music',              slug: 'generate-music',              description: 'Create original music and sound effects',              icon: '🎵' },
    // Business
    { id: 'uc-00000-0000-0000-000000000021', title: 'Automate Customer Support',   slug: 'automate-customer-support',   description: 'Handle customer queries with AI chatbots',             icon: '🤖' },
    { id: 'uc-00000-0000-0000-000000000022', title: 'Generate Leads',              slug: 'generate-leads',              description: 'Find and qualify potential customers',                 icon: '🎯' },
    { id: 'uc-00000-0000-0000-000000000023', title: 'Automate Emails',             slug: 'automate-emails',             description: 'Write and send personalized emails at scale',          icon: '📧' },
    { id: 'uc-00000-0000-0000-000000000024', title: 'Research Competitors',        slug: 'research-competitors',        description: 'Analyze competitor products and strategies',           icon: '🕵️' },
  ];

  async run(): Promise<void> {
    this.logger.log('Seeding use cases...');

    const existing = await this.prisma.useCase.count();
    if (existing > 0) {
      this.logger.log(`Found ${existing} existing use cases — deleting...`);
      await this.prisma.useCase.deleteMany();
    }

    await this.prisma.useCase.createMany({ data: this.useCases });

    const count = await this.prisma.useCase.count();
    this.logger.log(`✅ Use cases seeded — total: ${count}`);
  }
}