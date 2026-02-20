import { Injectable, Logger } from '@nestjs/common';
import { CategoriesSeed } from './categories.seed/categories.service';
import { TagsSeed } from './tags.seed/tages.service';
import { IndustriesSeed } from './industries.seed/industries.service';
import { UseCasesSeed } from './use-cases.seed/use-cases.service';


@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly categoriesSeed: CategoriesSeed,
    private readonly tagsSeed: TagsSeed,
    private readonly industriesSeed: IndustriesSeed,
    private readonly useCasesSeed: UseCasesSeed,
  ) {}

  async run() {
    this.logger.log('🌱 Seeding started...');

    await this.categoriesSeed.run();
    await this.tagsSeed.run();
    await this.industriesSeed.run();
    await this.useCasesSeed.run();

    this.logger.log('✅ Seeding completed');
  }
}