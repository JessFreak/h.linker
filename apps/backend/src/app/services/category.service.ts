import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../database/repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async syncUserSkills(userId: string, skills: string[]): Promise<void> {
    const syncTasks = skills.map(async (skill) => {
      await this.categoryRepository.upsertCategory(skill);

      await this.categoryRepository.linkUserToCategory(userId, skill);
    });

    await Promise.all(syncTasks);
  }

  async deleteUserSkills(userId: string): Promise<void> {
    await this.categoryRepository.deleteUserSkills(userId);
  }
}
