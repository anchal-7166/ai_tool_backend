import { Injectable, Logger } from '@nestjs/common';
import { ISeeding } from '../seeding.interface';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class IndustriesSeed implements ISeeding {
  private readonly logger = new Logger(IndustriesSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly industries = [
    { id: 'ind-0000-0000-0000-000000000001', name: 'E-commerce',           slug: 'e-commerce',         description: 'Online retail and product selling',              icon: '🛒' },
    { id: 'ind-0000-0000-0000-000000000002', name: 'Healthcare',           slug: 'healthcare',         description: 'Medical, health and wellness',                   icon: '🏥' },
    { id: 'ind-0000-0000-0000-000000000003', name: 'Education',            slug: 'education',          description: 'Learning, training and e-learning',              icon: '🎓' },
    { id: 'ind-0000-0000-0000-000000000004', name: 'Legal',                slug: 'legal',              description: 'Law firms, contracts and compliance',            icon: '⚖️' },
    { id: 'ind-0000-0000-0000-000000000005', name: 'Real Estate',          slug: 'real-estate',        description: 'Property buying, selling and management',        icon: '🏠' },
    { id: 'ind-0000-0000-0000-000000000006', name: 'Finance',              slug: 'finance',            description: 'Banking, fintech and investments',               icon: '💰' },
    { id: 'ind-0000-0000-0000-000000000007', name: 'Marketing',            slug: 'marketing',          description: 'Digital marketing and advertising',              icon: '📣' },
    { id: 'ind-0000-0000-0000-000000000008', name: 'HR & Recruiting',      slug: 'hr-recruiting',      description: 'Human resources and talent acquisition',         icon: '👥' },
    { id: 'ind-0000-0000-0000-000000000009', name: 'Gaming',               slug: 'gaming',             description: 'Video games and interactive entertainment',      icon: '🎮' },
    { id: 'ind-0000-0000-0000-000000000010', name: 'Media & Publishing',   slug: 'media-publishing',   description: 'News, content creation and publishing',          icon: '📺' },
    { id: 'ind-0000-0000-0000-000000000011', name: 'SaaS',                 slug: 'saas',               description: 'Software as a service businesses',               icon: '☁️' },
    { id: 'ind-0000-0000-0000-000000000012', name: 'Retail',               slug: 'retail',             description: 'Physical and online retail stores',              icon: '🏪' },
    { id: 'ind-0000-0000-0000-000000000013', name: 'Travel & Hospitality', slug: 'travel-hospitality', description: 'Travel, tourism and hospitality services',       icon: '✈️' },
    { id: 'ind-0000-0000-0000-000000000014', name: 'Food & Restaurant',    slug: 'food-restaurant',    description: 'Food service and restaurant industry',           icon: '🍕' },
    { id: 'ind-0000-0000-0000-000000000015', name: 'Cybersecurity',        slug: 'cybersecurity',      description: 'Security, privacy and threat protection',        icon: '🔒' },
    { id: 'ind-0000-0000-0000-000000000016', name: 'Non-profit',           slug: 'non-profit',         description: 'Charities and non-profit organizations',         icon: '❤️' },
  ];

  async run(): Promise<void> {
    this.logger.log('Seeding industries...');

    const existing = await this.prisma.industry.count();
    if (existing > 0) {
      this.logger.log(`Found ${existing} existing industries — deleting...`);
      await this.prisma.industry.deleteMany();
    }

    await this.prisma.industry.createMany({ data: this.industries });

    const count = await this.prisma.industry.count();
    this.logger.log(`✅ Industries seeded — total: ${count}`);
  }
}