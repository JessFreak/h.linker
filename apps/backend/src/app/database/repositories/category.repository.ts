import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCategory(name: string) {
    return this.prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async linkUserToCategory(userId: string, categoryName: string) {
    return this.prisma.userCategory.upsert({
      where: {
        userId_category: {
          userId,
          category: categoryName,
        },
      },
      update: {},
      create: {
        userId,
        category: categoryName,
      },
    });
  }
}
