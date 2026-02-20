import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { FiltersController } from './filter.controller';
import { ToolsFilterService } from './filter.service';


@Module({
  imports: [PrismaModule],
  controllers: [FiltersController],
  providers: [ToolsFilterService],
  exports: [ToolsFilterService],
})
export class FiltersModule {}