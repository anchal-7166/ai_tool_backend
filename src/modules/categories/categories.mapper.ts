import { Category } from '@prisma/client';

export class CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  order: number;
  parentId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Optional nested relations
  parent?: CategoryResponseDto | null;
  children?: CategoryResponseDto[];
  toolCount?: number;
}

type CategoryWithRelations = Category & {
  parent?: Category | null;
  children?: Category[];
  _count?: { tools?: number };
};

export class CategoryMapper {
  static toResponse(category: CategoryWithRelations): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      icon: category.icon ?? null,
      color: category.color ?? null,
      order: category.order,
      parentId: category.parentId ?? null,
      metaTitle: category.metaTitle ?? null,
      metaDescription: category.metaDescription ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      ...(category.parent !== undefined && {
        parent: category.parent
          ? CategoryMapper.toResponse(category.parent as CategoryWithRelations)
          : null,
      }),
      ...(category.children !== undefined && {
        children: category.children.map((c) =>
          CategoryMapper.toResponse(c as CategoryWithRelations),
        ),
      }),
      ...(category._count !== undefined && {
        toolCount: category._count.tools ?? 0,
      }),
    };
  }

  static toResponseList(categories: CategoryWithRelations[]): CategoryResponseDto[] {
    return categories.map((c) => CategoryMapper.toResponse(c));
  }
}