import { Controller, Get } from '@nestjs/common';
import { EnumOption, EnumsService } from './enum.service';

@Controller('enums')
export class EnumsController {
  constructor(private readonly enumsService: EnumsService) {}

  /**
   * GET /enums
   * Returns all enums in a single response — ideal for app bootstrap.
   */
  @Get()
  getAll(): Record<string, EnumOption[]> {
    return this.enumsService.getAllEnums();
  }

  /**
   * GET /enums/user-roles
   */
  @Get('user-roles')
  getUserRoles(): EnumOption[] {
    return this.enumsService.getUserRoles();
  }

  /**
   * GET /enums/tool-statuses
   */
  @Get('tool-statuses')
  getToolStatuses(): EnumOption[] {
    return this.enumsService.getToolStatuses();
  }

  /**
   * GET /enums/platform-types
   */
  @Get('platform-types')
  getPlatformTypes(): EnumOption[] {
    return this.enumsService.getPlatformTypes();
  }

  /**
   * GET /enums/target-audiences
   */
  @Get('target-audiences')
  getTargetAudiences(): EnumOption[] {
    return this.enumsService.getTargetAudiences();
  }

  /**
   * GET /enums/pricing-types
   */
  @Get('pricing-types')
  getPricingTypes(): EnumOption[] {
    return this.enumsService.getPricingTypes();
  }

  /**
   * GET /enums/billing-cycles
   */
  @Get('billing-cycles')
  getBillingCycles(): EnumOption[] {
    return this.enumsService.getBillingCycles();
  }

  /**
   * GET /enums/submission-statuses
   */
  @Get('submission-statuses')
  getSubmissionStatuses(): EnumOption[] {
    return this.enumsService.getSubmissionStatuses();
  }
}