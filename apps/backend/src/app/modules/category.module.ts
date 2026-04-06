import { Module } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { GithubService } from '../services/github.service';

@Module({
  exports: [CategoryService, GithubService],
  providers: [CategoryService, GithubService],
})
export class CategoryModule {}