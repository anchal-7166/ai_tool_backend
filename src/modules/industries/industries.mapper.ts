import { Industry } from '@prisma/client';

export class IndustryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  toolCount?: number;
}

type IndustryWithRelations = Industry & {
  _count?: { tools?: number };
};

export class IndustryMapper {
  static toResponse(industry: IndustryWithRelations): IndustryResponseDto {
    return {
      id: industry.id,
      name: industry.name,
      slug: industry.slug,
      description: industry.description ?? null,
      icon: industry.icon ?? null,
      createdAt: industry.createdAt,
      ...(industry._count !== undefined && {
        toolCount: industry._count.tools ?? 0,
      }),
    };
  }

  static toResponseList(industries: IndustryWithRelations[]): IndustryResponseDto[] {
    return industries.map((i) => IndustryMapper.toResponse(i));
  }
}