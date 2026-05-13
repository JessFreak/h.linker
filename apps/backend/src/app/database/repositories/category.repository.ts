import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Category, Prisma, UserCategory } from '@prisma/client';

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertCategory(name: string): Promise<Category> {
    return this.prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  async linkUserToCategory(
    userId: string,
    skill: string,
  ): Promise<UserCategory> {
    return this.prisma.userCategory.upsert({
      where: {
        userId_category: {
          userId,
          category: skill,
        },
      },
      update: {},
      create: {
        userId,
        category: skill,
      },
    });
  }

  async deleteUserSkills(userId: string): Promise<void> {
    await this.prisma.userCategory.deleteMany({ where: { userId: userId } });
  }

  async syncHackathonCategories(
    hackathonId: string,
    categoryNames: string[],
  ): Promise<Prisma.BatchPayload | []> {
    return this.prisma.$transaction(async (tx) => {
      await tx.hackathonCategory.deleteMany({
        where: { hackathonId },
      });

      if (!categoryNames || categoryNames.length === 0) return [];

      await Promise.all(
        categoryNames.map((name) =>
          tx.category.upsert({
            create: { name },
            update: {},
            where: { name },
          }),
        ),
      );

      return tx.hackathonCategory.createMany({
        data: categoryNames.map((name) => ({
          hackathonId,
          category: name,
        })),
        skipDuplicates: true,
      });
    });
  }

  async search(query?: string): Promise<Category[]> {
    const isSearch = !!query && query.trim().length > 0;

    return this.prisma.category.findMany({
      where: isSearch
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }
        : {},
      take: isSearch ? 10 : 100,
      select: { name: true },
      orderBy: { name: 'asc' },
    });
  }
}
