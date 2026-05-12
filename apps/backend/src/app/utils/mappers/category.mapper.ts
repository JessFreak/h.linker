import { Category } from '@prisma/client';
import { CategorySearchResponse } from '@h.linker/libs';

export class CategoryMapper {
  static getCategorySearchResponse(categories: Category[]): CategorySearchResponse {
    return {
      categories: categories.map((cat) => cat.name),
    };
  }
}
