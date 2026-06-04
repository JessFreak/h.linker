import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HackathonStatus, Prisma } from '@prisma/client';
import { FullHackathon } from '../entities/hackathon.entity';
import { BaseQueryDTO, PageResponse } from '@h.linker/libs';
import { Paginator } from '../../utils/prisma-pagination.util';

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

  async findAllPaged(
    query: BaseQueryDTO,
    where?: Prisma.HackathonWhereInput,
    orderBy?: Prisma.HackathonOrderByWithRelationInput,
  ): Promise<PageResponse<FullHackathon>> {
    return Paginator.paginate<FullHackathon>(
      ({ skip, take }) =>
        this.prisma.hackathon.findMany({
          where,
          orderBy,
          include: this.hackathonFullInclude,
          skip,
          take,
        }),
      () => this.prisma.hackathon.count({ where }),
      query,
    );
  }

  async getAll(): Promise<FullHackathon[]> {
    return this.prisma.hackathon.findMany({
      include: this.hackathonFullInclude,
    });
  }

  async checkExistsById(id: string): Promise<boolean> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!hackathon;
  }

  async checkExistsBySlug(slug: string): Promise<boolean> {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { slug },
      select: { id: true },
    });
    return !!hackathon;
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

  async getInsightsData(hackathonId: string) {
    return this.prisma.hackathon.findUnique({
      where: { id: hackathonId },
      include: {
        participations: {
          include: {
            team: {
              include: {
                members: { where: { status: 'ACCEPTED' } },
              },
            },
            scores: true,
            reviews: true,
          },
        },
      },
    });
  }

  async updateToActive(currentTime: Date) {
    return this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.REGISTRATION,
        startDate: { lte: currentTime },
      },
      data: {
        status: HackathonStatus.ACTIVE,
      },
    });
  }

  async updateToFinished(currentTime: Date) {
    return this.prisma.hackathon.updateMany({
      where: {
        status: HackathonStatus.ACTIVE,
        endDate: { lte: currentTime },
      },
      data: {
        status: HackathonStatus.FINISHED,
      },
    });
  }
}
