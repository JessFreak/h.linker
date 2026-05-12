import { Module } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { GithubService } from '../services/github.service';
import { CategoryController } from '../controllers/category.controller';

@Module({
  controllers: [CategoryController],
  exports: [CategoryService, GithubService],
  providers: [CategoryService, GithubService],
})
export class CategoryModule {}