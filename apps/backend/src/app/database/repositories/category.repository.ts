import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Category, Prisma, UserCategory } from '@prisma/client';
import { HackathonCategoryWithCat } from '../entities/hackathon.entity';

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

      return tx.hackathonCategory.createMany({
        data: categoryNames.map((name) => ({
          hackathonId,
          category: name,
        })),
        skipDuplicates: true,
      });
    });
  }

  async getByHackathonId(
    hackathonId: string,
  ): Promise<HackathonCategoryWithCat[]> {
    return this.prisma.hackathonCategory.findMany({
      where: { hackathonId },
      include: { cat: true },
    });
  }
}
