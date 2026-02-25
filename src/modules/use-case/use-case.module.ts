import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UseCaseController } from './use-case.controller';
import { UseCaseService } from './use-case.service';
import { UseCaseRepository } from './use-case.repository';

@Module({
  controllers: [UseCaseController],
  providers: [UseCaseService, UseCaseRepository, PrismaService],
  exports: [UseCaseService, UseCaseRepository],
})
export class UseCaseModule {}