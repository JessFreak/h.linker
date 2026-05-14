import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserTeamStatus } from '@prisma/client';
import { ParticipationWithTeam } from '../entities/participation.entity';

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
}
