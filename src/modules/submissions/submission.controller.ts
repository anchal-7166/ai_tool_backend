import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole, SubmissionStatus } from '@prisma/client';
import { SubmissionsService } from './submission.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { RolesGuard } from '../auth/role-guard';
import { Roles } from '../auth/role-decorator';
import { ReviewSubmissionDto } from './dto/review-submission';
import { JwtAuthGuard } from '../auth/jwtguard';


@ApiTags('Submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  // ==================== CREATOR ====================

  // POST /submissions
  @Post()
  @ApiOperation({ summary: 'Submit a new tool for admin review' })
  async create(
    @Request() req,
    @CurrentUser() id,
    @Body() dto: CreateSubmissionDto,
  ) {
     console.log(req.user, id,"**********************")
     const userId = req.user.id;
    
    return this.submissionsService.create(userId, dto);
  }

  // GET /submissions/my
  @Get('my')
  @ApiOperation({ summary: 'Get all my submissions with their status' })
  async getMySubmissions(@CurrentUser('id') userId: string) {
    return this.submissionsService.findMySubmissions(userId);
  }

  // GET /submissions/my/:id
  @Get('my/:id')
  @ApiOperation({ summary: 'Get a specific submission by ID' })
  async getOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.submissionsService.findOne(id, userId, role);
  }

  // ==================== ADMIN / MODERATOR ====================

  // GET /submissions?status=PENDING
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get all submissions — admin review queue' })
  @ApiQuery({ name: 'status', enum: SubmissionStatus, required: false })
  async findAll(@Query('status') status?: SubmissionStatus) {
    return this.submissionsService.findAll(status);
  }

  // PATCH /submissions/:id/review
  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject a submission (creates Tool on approval)' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
  ) {
    return this.submissionsService.review(id, dto);
  }
}