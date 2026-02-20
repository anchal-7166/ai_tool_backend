import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { SubmissionsController } from './submission.controller';
import { SubmissionsRepository } from './submission.repository';
import { SubmissionsService } from './submission.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [PrismaModule,AuthModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}