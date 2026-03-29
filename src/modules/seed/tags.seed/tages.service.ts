import { Injectable, Logger } from '@nestjs/common';
import { ISeeding } from '../seeding.interface';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class TagsSeed implements ISeeding {
  private readonly logger = new Logger(TagsSeed.name);

  constructor(private readonly prisma: PrismaService) {}

  private readonly tags = [
    // AI Models
    { id: 'tag-0000-0000-0000-000000000001', name: 'GPT-4',              slug: 'gpt-4'              },
    { id: 'tag-0000-0000-0000-000000000002', name: 'GPT-3.5',            slug: 'gpt-3-5'            },
    { id: 'tag-0000-0000-0000-000000000003', name: 'Claude',             slug: 'claude'             },
    { id: 'tag-0000-0000-0000-000000000004', name: 'Gemini',             slug: 'gemini'             },
    { id: 'tag-0000-0000-0000-000000000005', name: 'Llama',              slug: 'llama'              },
    { id: 'tag-0000-0000-0000-000000000006', name: 'Stable Diffusion',   slug: 'stable-diffusion'   },
    { id: 'tag-0000-0000-0000-000000000007', name: 'DALL-E',             slug: 'dall-e'             },
    { id: 'tag-0000-0000-0000-000000000008', name: 'Whisper',            slug: 'whisper'            },
    { id: 'tag-0000-0000-0000-000000000009', name: 'Custom Model',       slug: 'custom-model'       },
    // Features
    { id: 'tag-0000-0000-0000-000000000010', name: 'API Available',      slug: 'api-available'      },
    { id: 'tag-0000-0000-0000-000000000011', name: 'Open Source',        slug: 'open-source'        },
    { id: 'tag-0000-0000-0000-000000000012', name: 'Free Tier',          slug: 'free-tier'          },
    { id: 'tag-0000-0000-0000-000000000013', name: 'No Code',            slug: 'no-code'            },
    { id: 'tag-0000-0000-0000-000000000014', name: 'Real-time',          slug: 'real-time'          },
    { id: 'tag-0000-0000-0000-000000000015', name: 'Offline Mode',       slug: 'offline-mode'       },
    { id: 'tag-0000-0000-0000-000000000016', name: 'Multi-language',     slug: 'multi-language'     },
    { id: 'tag-0000-0000-0000-000000000017', name: 'Team Collaboration', slug: 'team-collaboration' },
    { id: 'tag-0000-0000-0000-000000000018', name: 'White Label',        slug: 'white-label'        },
    { id: 'tag-0000-0000-0000-000000000019', name: 'Zapier Integration', slug: 'zapier-integration' },
    // Platform
    { id: 'tag-0000-0000-0000-000000000020', name: 'Mobile App',         slug: 'mobile-app'         },
    { id: 'tag-0000-0000-0000-000000000021', name: 'Browser Extension',  slug: 'browser-extension'  },
    { id: 'tag-0000-0000-0000-000000000022', name: 'Desktop App',        slug: 'desktop-app'        },
    { id: 'tag-0000-0000-0000-000000000023', name: 'CLI Tool',           slug: 'cli-tool'           },
    { id: 'tag-0000-0000-0000-000000000024', name: 'Web Based',          slug: 'web-based'          },
    { id: 'tag-0000-0000-0000-000000000025', name: 'VS Code Extension',  slug: 'vscode-extension'   },
    // Pricing
    { id: 'tag-0000-0000-0000-000000000026', name: 'Completely Free',    slug: 'completely-free'    },
    { id: 'tag-0000-0000-0000-000000000027', name: 'Usage Based',        slug: 'usage-based'        },
    { id: 'tag-0000-0000-0000-000000000028', name: 'One Time Purchase',  slug: 'one-time-purchase'  },
    { id: 'tag-0000-0000-0000-000000000029', name: 'Enterprise',         slug: 'enterprise'         },
    // Tech
    { id: 'tag-0000-0000-0000-000000000030', name: 'Python SDK',         slug: 'python-sdk'         },
    { id: 'tag-0000-0000-0000-000000000031', name: 'JavaScript SDK',     slug: 'javascript-sdk'     },
    { id: 'tag-0000-0000-0000-000000000032', name: 'REST API',           slug: 'rest-api'           },
    { id: 'tag-0000-0000-0000-000000000033', name: 'Webhook Support',    slug: 'webhook-support'    },
  ];

  async run(): Promise<void> {
    this.logger.log('Seeding tags...');

    const existing = await this.prisma.tag.count();
    if (existing > 0) {
      this.logger.log(`Found ${existing} existing tags — deleting...`);
      await this.prisma.tag.deleteMany();
    }

    await this.prisma.tag.createMany({ data: this.tags });

    const count = await this.prisma.tag.count();
    this.logger.log(`✅ Tags seeded — total: ${count}`);
  }
}