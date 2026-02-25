import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TagController } from './tags.controller';
import { TagService } from './tags.service';
import { TagRepository } from './tags.repository';

@Module({
  controllers: [TagController],
  providers: [TagService, TagRepository, PrismaService],
  exports: [TagService, TagRepository],
})
export class TagModule {}