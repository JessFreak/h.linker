import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, UserTeamStatus } from '@prisma/client';
import {
  LeaderboardRow,
  ParticipationWithScoresAndReviews,
  ParticipationWithTeam,
  ReviewWithJuryData,
} from '../entities/participation.entity';
import { BaseQueryDTO, PageMetaResponse, PageResponse } from '@h.linker/libs';

@Injectable()
export class ParticipationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly showcaseInclude = {
    team: {
      include: {
        members: {
          where: { status: 'ACCEPTED' },
        },
      },
    },
    hackathon: {
      include: {
        criteria: true,
        categories: { include: { cat: true } },
      },
    },
  } satisfies Prisma.ParticipationInclude;

  async findUserParticipation(
    hackathonId: string,
    userId: string,
  ): Promise<ParticipationWithTeam> {
    return this.prisma.participation.findFirst({
      where: {
        hackathonId,
        team: {
          members: {
            some: {
              userId,
              status: UserTeamStatus.ACCEPTED,
            },
          },
        },
      },
      include: {
        team: true,
        scores: {
          include: {
            criterion: true,
          },
        },
      },
    });
  }

  async checkExistsById(id: string): Promise<boolean> {
    const participation = await this.prisma.participation.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!participation;
  }

  async create(hackathonId: string, teamId: string): Promise<void> {
    await this.prisma.participation.create({
      data: {
        hackathonId,
        teamId,
      },
    });
  }

  async findByTeamAndHackathon(hackathonId: string, teamId: string) {
    return this.prisma.participation.findUnique({
      where: {
        teamId_hackathonId: { teamId, hackathonId },
      },
    });
  }

  async updateSubmission(
    hackathonId: string,
    teamId: string,
    data: Prisma.ParticipationUncheckedUpdateInput,
  ): Promise<void> {
    await this.prisma.participation.update({
      where: {
        teamId_hackathonId: {
          teamId,
          hackathonId,
        },
      },
      data,
    });
  }

  async findAllSubmissionsByHackathonId(
    hackathonId: string,
  ): Promise<ParticipationWithScoresAndReviews[]> {
    return this.prisma.participation.findMany({
      where: {
        hackathonId,
        githubRepoUrl: { not: null },
      },
      include: {
        team: true,
        reviews: {
          include: {
            jury: { include: { user: true } },
          },
        },
        scores: {
          include: {
            criterion: true,
            jury: { include: { user: true } },
          },
        },
      },
      orderBy: { updatedAt: 'asc' },
    });
  }

  async getLeaderboardData(hackathonId: string): Promise<LeaderboardRow[]> {
    return this.prisma.participation.findMany({
      where: { hackathonId },
      select: {
        teamId: true,
        finalScore: true,
        team: {
          select: {
            name: true,
            members: {
              where: { status: 'ACCEPTED' },
              select: { id: true },
            },
          },
        },
      },
      orderBy: {
        finalScore: 'desc',
      },
    });
  }

  async findReviewsByMember(
    hackathonId: string,
    userId: string,
  ): Promise<ReviewWithJuryData[]> {
    return this.prisma.review.findMany({
      where: {
        participation: {
          hackathonId,
          team: {
            members: {
              some: {
                userId,
                status: UserTeamStatus.ACCEPTED,
              },
            },
          },
        },
      },
      include: {
        jury: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findShowcasePagedByPercentage(
    query: BaseQueryDTO,
    where: Prisma.ParticipationWhereInput,
  ) {
    const page = query.page ?? 1;
    const take = query.take ?? 10;
    const skip = (page - 1) * take;

    const lightweightParticipations = await this.prisma.participation.findMany({
      where,
      select: {
        id: true,
        finalScore: true,
        hackathon: {
          select: {
            criteria: {
              select: { weight: true, maxValue: true },
            },
          },
        },
      },
    });

    const calculated = lightweightParticipations.map((p) => {
      const maxScore = p.hackathon.criteria.reduce(
        (acc, c) => acc + c.maxValue * (c.weight / 100),
        0,
      );
      const percentage = maxScore > 0 ? (p.finalScore / maxScore) * 100 : 0;

      return { id: p.id, percentage };
    });

    const isAsc = query.order === 'asc';
    calculated.sort((a, b) =>
      isAsc ? a.percentage - b.percentage : b.percentage - a.percentage,
    );

    const paginatedIds = calculated.slice(skip, skip + take).map((c) => c.id);

    const rawData = await this.prisma.participation.findMany({
      where: { id: { in: paginatedIds } },
      include: this.showcaseInclude,
    });

    const sortedData = paginatedIds
      .map((id) => rawData.find((d) => d.id === id))
      .filter((d): d is NonNullable<typeof d> => d !== undefined);

    const itemCount = lightweightParticipations.length;
    const meta = new PageMetaResponse({ page, take, itemCount });

    return new PageResponse(sortedData, meta);
  }
}
