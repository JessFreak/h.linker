import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { FullHackathon } from '../entities/hackathon.entity';

@Injectable()
export class HackathonRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly hackathonFullInclude = {
    creator: true,
    categories: {
      include: {
        cat: true,
      },
    },
    criteria: true,
    jury: {
      include: {
        user: true,
      },
    },
    _count: {
      select: { participations: true },
    },
  } satisfies Prisma.HackathonInclude;

  async create(
    data: Prisma.HackathonUncheckedCreateInput,
  ): Promise<FullHackathon> {
    return this.prisma.hackathon.create({
      data,
      include: this.hackathonFullInclude,
    });
  }

  async getAll(): Promise<FullHackathon[]> {
    return this.prisma.hackathon.findMany({
      include: this.hackathonFullInclude,
    });
  }

  async getById(id: string): Promise<FullHackathon | null> {
    return this.prisma.hackathon.findUnique({
      where: { id },
      include: this.hackathonFullInclude,
    });
  }

  async getBySlug(slug: string): Promise<FullHackathon> {
    return this.prisma.hackathon.findUnique({
      where: { slug },
      include: this.hackathonFullInclude,
    });
  }

  async updateById(
    id: string,
    data: Prisma.HackathonUncheckedUpdateInput,
  ): Promise<FullHackathon> {
    return this.prisma.hackathon.update({
      data,
      where: { id },
      include: this.hackathonFullInclude,
    });
  }

  async isCreator(hackathonId: string, userId: string): Promise<boolean> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      select: { creatorId: true },
    });
    return hackathon?.creatorId === userId;
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.hackathon.delete({ where: { id } });
  }
}
