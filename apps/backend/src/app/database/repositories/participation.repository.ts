import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, UserTeamStatus } from '@prisma/client';
import {
  LeaderboardRow,
  ParticipationWithTeam,
} from '../entities/participation.entity';

@Injectable()
export class ParticipationRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      },
    });
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
  ): Promise<ParticipationWithTeam[]> {
    return this.prisma.participation.findMany({
      where: {
        hackathonId,
        githubRepoUrl: {
          not: null,
        },
      },
      include: {
        team: true,
      },
      orderBy: {
        updatedAt: 'asc',
      },
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
          },
        },
      },
      orderBy: {
        finalScore: 'desc',
      },
    });
  }
}
