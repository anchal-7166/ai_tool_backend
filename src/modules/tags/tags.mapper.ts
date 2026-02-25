import { Tag } from '@prisma/client';

export class TagResponseDto {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: Date;
}

export class TagMapper {
  static toResponse(tag: Tag): TagResponseDto {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      usageCount: tag.usageCount,
      createdAt: tag.createdAt,
    };
  }

  static toResponseList(tags: Tag[]): TagResponseDto[] {
    return tags.map((t) => TagMapper.toResponse(t));
  }
}