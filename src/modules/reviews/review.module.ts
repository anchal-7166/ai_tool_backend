// src/modules/reviews/reviews.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { ReviewsController } from './review.controller';
import { ReviewsService } from './review.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}