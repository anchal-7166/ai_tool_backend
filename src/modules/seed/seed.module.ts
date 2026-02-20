import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { SeedService } from './sedding.service';
import { CategoriesSeed } from './categories.seed/categories.service';
import { TagsSeed } from './tags.seed/tages.service';
import { IndustriesSeed } from './industries.seed/industries.service';
import { UseCasesSeed } from './use-cases.seed/use-cases.service';


@Module({
  imports: [PrismaModule],
  providers: [
    SeedService,
    CategoriesSeed,
    TagsSeed,
    IndustriesSeed,
    UseCasesSeed,
  ],
})
export class SeedModule {}