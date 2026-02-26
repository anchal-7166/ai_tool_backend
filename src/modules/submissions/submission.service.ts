import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubmissionStatus, UserRole } from '@prisma/client';
import { SubmissionsRepository } from './submission.repository';
import { PrismaService } from 'src/database/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission';


@Injectable()
export class SubmissionsService {
  constructor(
    private readonly submissionsRepo: SubmissionsRepository,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ==================== CREATOR ====================

  async create(userId: string, dto: CreateSubmissionDto) {
    // 1. Daily limit check
    const dailyLimit = this.config.get<number>('app.submissions.dailyLimit') ?? 3;
    const todayCount = await this.submissionsRepo.countTodayByUser(userId);
    if (todayCount >= 100) {
      throw new BadRequestException(
        `Daily submission limit of ${dailyLimit} reached. Try again tomorrow.`,
      );
    }

    // 2. Slug uniqueness check
    const slugExists = await this.prisma.tool.findUnique({
      where: { slug: dto.slug },
    });
    if (slugExists) {
      throw new BadRequestException(
        `Slug "${dto.slug}" is already taken. Please choose a different one.`,
      );
    }

    // 3. Validate all relation IDs actually exist in DB
    await this.validateRelationIds(dto);

    // 4. Store full DTO as JSON in toolData
    return this.submissionsRepo.create({
      userId,
      status: SubmissionStatus.PENDING,
      toolData: dto as any,
    });
  }

  async findMySubmissions(userId: string) {
    return this.submissionsRepo.findByUser(userId);
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const submission = await this.submissionsRepo.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');

    if (
      submission.userId !== userId &&
      userRole !== UserRole.ADMIN &&
      userRole !== UserRole.MODERATOR
    ) {
      throw new ForbiddenException('You can only view your own submissions');
    }

    return submission;
  }

  // ==================== ADMIN / MODERATOR ====================

  async findAll(status?: SubmissionStatus) {
    return this.prisma.submission.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, email: true, username: true } },
      },
    });
  }

  async review(id: string, dto: ReviewSubmissionDto) {
    
    const submission = await this.submissionsRepo.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');

    if (submission.status !== SubmissionStatus.PENDING) {
      throw new BadRequestException(`Submission is already ${submission.status}`);
    }

    if (dto.status === 'REJECTED' && !dto.reviewNote) {
      throw new BadRequestException(
        'reviewNote is required when rejecting a submission',
      );
    }

    if (dto.status === 'APPROVED') {
      await this.createToolFromSubmission(submission);
    }

    return this.submissionsRepo.update(id, {
      status:     dto.status,
      reviewNote: dto.reviewNote ?? null,
      reviewedAt: new Date(),
    });
  }

  // ==================== PRIVATE: CREATE TOOL ====================

  private async createToolFromSubmission(submission: any) {
    const d = submission.toolData as CreateSubmissionDto;

    await this.prisma.$transaction(async (tx) => {

      // 1. Create Tool record
      const tool = await tx.tool.create({
        data: {
          name:             d.name,
          slug:             d.slug,
          tagline:          d.tagline,
          description:      d.description,
          longDescription:  d.longDescription   ?? null,
          websiteUrl:       d.websiteUrl         ?? null,
          demoUrl:          d.demoUrl            ?? null,
          documentationUrl: d.documentationUrl   ?? null,
          videoUrl:         d.videoUrl           ?? null,
          logo:             d.logo               ?? null,
          aiModel:          d.aiModel            ?? null,
          platformType:     d.platformType       ?? [],
          targetAudience:   d.targetAudience     ?? [],
          searchKeywords:   d.searchKeywords     ?? [],
          status:           'APPROVED',
          isPublished:      false,
          userId:           submission.userId,
        },
      });

      // 2. Categories — first ID = isPrimary: true, rest = false
      if (d.categoryIds?.length) {
        await tx.toolCategory.createMany({
          data: d.categoryIds.map((categoryId, index) => ({
            toolId:     tool.id,
            categoryId,
            isPrimary:  index === 0,
          })),
        });
      }

      // 3. Tags + increment usageCount on each
      if (d.tagIds?.length) {
        await tx.toolTag.createMany({
          data: d.tagIds.map((tagId) => ({ toolId: tool.id, tagId })),
        });
        await tx.tag.updateMany({
          where: { id: { in: d.tagIds } },
          data:  { usageCount: { increment: 1 } },
        });
      }

      // 4. Use Cases
      if (d.useCaseIds?.length) {
        await tx.toolUseCase.createMany({
          data: d.useCaseIds.map((useCaseId) => ({ toolId: tool.id, useCaseId })),
        });
      }

      // 5. Industries
      if (d.industryIds?.length) {
        await tx.toolIndustry.createMany({
          data: d.industryIds.map((industryId) => ({ toolId: tool.id, industryId })),
        });
      }

      // 6. Pricing Plans — full details from creator
      if (d.pricingPlans?.length) {
        await tx.pricingPlan.createMany({
          data: d.pricingPlans.map((plan) => ({
            toolId:          tool.id,
            name:            plan.name,
            type:            plan.type,
            price:           plan.price           ?? null,
            currency:        plan.currency        ?? 'USD',
            billingCycle:    plan.billingCycle     ?? null,
            description:     plan.description     ?? null,
            features:        plan.features        ?? [],
            trialDays:       plan.trialDays        ?? null,
            minSeats:        plan.minSeats         ?? null,
            maxSeats:        plan.maxSeats         ?? null,
            monthlyRequests: plan.monthlyRequests  ?? null,
            storageLimit:    plan.storageLimit     ?? null,
          })),
        });
      }

      // 7. Screenshots — ordered list of tool UI images
      if (d.screenshots?.length) {
        await tx.screenshot.createMany({
          data: d.screenshots.map((s, index) => ({
            toolId:  tool.id,
            url:     s.url,
            caption: s.caption  ?? null,
            order:   s.order    ?? index,  // use provided order or fallback to array index
          })),
        });
      }

      // 8. Integrations — third-party services the tool supports
      if (d.integrations?.length) {
        await tx.integration.createMany({
          data: d.integrations.map((i) => ({
            toolId:      tool.id,
            name:        i.name,
            description: i.description ?? null,
            logo:        i.logo        ?? null,
            url:         i.url         ?? null,
          })),
        });
      }
    });
  }


  async findMyToolsWithSubmissionStatus(userId: string) {    
    return this.prisma.submission.findMany({
      where: {
        userId,
        status: SubmissionStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        reviewNote: true,
        reviewedAt: true,
        toolData: true,
      },
    });
  }

  // ==================== PRIVATE: VALIDATE IDs ====================

  private async validateRelationIds(dto: CreateSubmissionDto) {
    const errors: string[] = [];

    if (dto.categoryIds?.length) {
      const found = await this.prisma.category.count({
        where: { id: { in: dto.categoryIds } },
      });
      if (found !== dto.categoryIds.length) {
        errors.push('One or more category IDs are invalid');
      }
    }

    if (dto.tagIds?.length) {
      const found = await this.prisma.tag.count({
        where: { id: { in: dto.tagIds } },
      });
      if (found !== dto.tagIds.length) {
        errors.push('One or more tag IDs are invalid');
      }
    }

    if (dto.useCaseIds?.length) {
      const found = await this.prisma.useCase.count({
        where: { id: { in: dto.useCaseIds } },
      });
      if (found !== dto.useCaseIds.length) {
        errors.push('One or more use case IDs are invalid');
      }
    }

    if (dto.industryIds?.length) {
      const found = await this.prisma.industry.count({
        where: { id: { in: dto.industryIds } },
      });
      if (found !== dto.industryIds.length) {
        errors.push('One or more industry IDs are invalid');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }


}