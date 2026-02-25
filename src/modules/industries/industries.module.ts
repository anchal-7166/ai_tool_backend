import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IndustryController } from './industries.controller';
import { IndustryService } from './industries.service';
import { IndustryRepository } from './industries.repositories';

@Module({
  controllers: [IndustryController],
  providers: [IndustryService, IndustryRepository, PrismaService],
  exports: [IndustryService, IndustryRepository],
})
export class IndustryModule {}