import { UseCase } from '@prisma/client';

export class UseCaseResponseDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
  toolCount?: number;
}

type UseCaseWithRelations = UseCase & {
  _count?: { tools?: number };
};

export class UseCaseMapper {
  static toResponse(useCase: UseCaseWithRelations): UseCaseResponseDto {
    return {
      id: useCase.id,
      title: useCase.title,
      slug: useCase.slug,
      description: useCase.description ?? null,
      icon: useCase.icon ?? null,
      createdAt: useCase.createdAt,
      ...(useCase._count !== undefined && {
        toolCount: useCase._count.tools ?? 0,
      }),
    };
  }

  static toResponseList(useCases: UseCaseWithRelations[]): UseCaseResponseDto[] {
    return useCases.map((u) => UseCaseMapper.toResponse(u));
  }
}