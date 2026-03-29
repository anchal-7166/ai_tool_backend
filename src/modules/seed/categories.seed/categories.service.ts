import { Injectable, Logger } from '@nestjs/common';
import { ISeeding } from '../seeding.interface';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class CategoriesSeed implements ISeeding {
  private readonly logger = new Logger(CategoriesSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly categories = [
    { id: 'cat-0000-0000-0000-000000000001', name: 'Chatbots',         slug: 'chatbots',         description: 'Conversational AI assistants and chatbots',          icon: '💬', color: '#4ECDC4', order: 1  },
    { id: 'cat-0000-0000-0000-000000000002', name: 'Image Generation', slug: 'image-generation', description: 'AI tools for generating and editing images',         icon: '🎨', color: '#FF6B6B', order: 2  },
    { id: 'cat-0000-0000-0000-000000000003', name: 'Code Assistants',  slug: 'code-assistants',  description: 'AI tools for writing, reviewing and debugging code', icon: '💻', color: '#45B7D1', order: 3  },
    { id: 'cat-0000-0000-0000-000000000004', name: 'Writing Tools',    slug: 'writing-tools',    description: 'AI tools for content writing and copywriting',       icon: '✍️', color: '#96CEB4', order: 4  },
    { id: 'cat-0000-0000-0000-000000000005', name: 'Video Generation', slug: 'video-generation', description: 'AI tools for creating and editing videos',           icon: '🎬', color: '#FFEAA7', order: 5  },
    { id: 'cat-0000-0000-0000-000000000006', name: 'Audio & Music',    slug: 'audio-music',      description: 'AI tools for audio generation, music and voice',    icon: '🎵', color: '#DDA0DD', order: 6  },
    { id: 'cat-0000-0000-0000-000000000007', name: 'Data Analysis',    slug: 'data-analysis',    description: 'AI tools for analyzing and visualizing data',        icon: '📊', color: '#98D8C8', order: 7  },
    { id: 'cat-0000-0000-0000-000000000008', name: 'SEO Tools',        slug: 'seo-tools',        description: 'AI tools for search engine optimization',            icon: '🔍', color: '#F7DC6F', order: 8  },
    { id: 'cat-0000-0000-0000-000000000009', name: 'Customer Support', slug: 'customer-support', description: 'AI tools for customer service automation',           icon: '🎧', color: '#85C1E9', order: 9  },
    { id: 'cat-0000-0000-0000-000000000010', name: 'Productivity',     slug: 'productivity',     description: 'AI tools to boost productivity and automation',      icon: '⚡', color: '#F0B27A', order: 10 },
    { id: 'cat-0000-0000-0000-000000000011', name: 'Design Tools',     slug: 'design-tools',     description: 'AI-powered design and creative tools',               icon: '🎭', color: '#C39BD3', order: 11 },
    { id: 'cat-0000-0000-0000-000000000012', name: 'Research Tools',   slug: 'research-tools',   description: 'AI tools for research and information gathering',    icon: '🔬', color: '#76D7C4', order: 12 },
    { id: 'cat-0000-0000-0000-000000000013', name: 'Translation',      slug: 'translation',      description: 'AI tools for language translation',                  icon: '🌍', color: '#AED6F1', order: 13 },
    { id: 'cat-0000-0000-0000-000000000014', name: 'Marketing',        slug: 'marketing',        description: 'AI tools for marketing and advertising',             icon: '📣', color: '#F1948A', order: 14 },
    { id: 'cat-0000-0000-0000-000000000015', name: 'HR & Recruiting',  slug: 'hr-recruiting',    description: 'AI tools for human resources and recruitment',       icon: '👥', color: '#A9DFBF', order: 15 },
  ];

  async run(): Promise<void> {
    this.logger.log('Seeding categories...');

    // If data exists → delete first, then re-seed with fixed IDs
    const existing = await this.prisma.category.count();
    if (existing > 0) {
      this.logger.log(`Found ${existing} existing categories — deleting...`);
      await this.prisma.category.deleteMany();
    }

    await this.prisma.category.createMany({ data: this.categories });

    const count = await this.prisma.category.count();
    this.logger.log(`✅ Categories seeded — total: ${count}`);
  }
}