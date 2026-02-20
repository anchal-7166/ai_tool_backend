import { Injectable } from '@nestjs/common';
import { Submission, SubmissionStatus } from '@prisma/client';
import { BaseRepository } from '../base-repository/base-repository';
import { PrismaService } from 'src/database/prisma.service';


@Injectable()
export class SubmissionsRepository extends BaseRepository<Submission> {
  constructor(prisma: PrismaService) {
    super(prisma, 'submission');
  }

  // Count submissions made today by a specific user (daily limit check)
  async countTodayByUser(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.submission.count({
      where: {
        userId,
        createdAt: { gte: startOfDay },
      },
    });
  }

  // Get all submissions by a specific user with user info
  async findByUser(userId: string): Promise<Submission[]> {
    return this.prisma.submission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}