import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { CategoryRepository } from './categories.repository';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, PrismaService],
  exports: [CategoryService, CategoryRepository],
})
export class CategoryModule {}