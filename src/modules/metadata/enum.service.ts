import { Injectable } from '@nestjs/common';
import {
  UserRole,
  ToolStatus,
  PlatformType,
  TargetAudience,
  PricingType,
  BillingCycle,
  SubmissionStatus,
} from '@prisma/client';

export interface EnumOption {
  value: string;
  label: string;
}

const toLabel = (value: string): string =>
  value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const toOptions = (enumObj: Record<string, string>): EnumOption[] =>
  Object.values(enumObj).map((value) => ({ value, label: toLabel(value) }));

@Injectable()
export class EnumsService {
  getUserRoles(): EnumOption[] {
    return toOptions(UserRole);
  }

  getToolStatuses(): EnumOption[] {
    return toOptions(ToolStatus);
  }

  getPlatformTypes(): EnumOption[] {
    return toOptions(PlatformType);
  }

  getTargetAudiences(): EnumOption[] {
    return toOptions(TargetAudience);
  }

  getPricingTypes(): EnumOption[] {
    return toOptions(PricingType);
  }

  getBillingCycles(): EnumOption[] {
    return toOptions(BillingCycle);
  }

  getSubmissionStatuses(): EnumOption[] {
    return toOptions(SubmissionStatus);
  }

  /**
   * Returns all enums in a single payload — useful for a one-shot
   * bootstrap call from the frontend on app load.
   */
  getAllEnums(): Record<string, EnumOption[]> {
    return {
      userRoles: this.getUserRoles(),
      toolStatuses: this.getToolStatuses(),
      platformTypes: this.getPlatformTypes(),
      targetAudiences: this.getTargetAudiences(),
      pricingTypes: this.getPricingTypes(),
      billingCycles: this.getBillingCycles(),
      submissionStatuses: this.getSubmissionStatuses(),
    };
  }
}