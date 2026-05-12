import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { CategoryMapper } from '../utils/mappers/category.mapper';
import { CategorySearchResponse } from '@h.linker/libs';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async search(@Query('q') query: string): Promise<CategorySearchResponse> {
    const categories = await this.categoryService.search(query);
    return CategoryMapper.getCategorySearchResponse(categories);
  }
}
