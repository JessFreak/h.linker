import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, UserTeam, UserTeamStatus } from '@prisma/client';

@Injectable()
export class MemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMember(teamId: string, userId: string): Promise<UserTeam> {
    return this.prisma.userTeam.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });
  }

  async addMember(
    data: Prisma.UserTeamUncheckedCreateInput,
  ): Promise<UserTeam> {
    return this.prisma.userTeam.create({
      data: {
        ...data,
        status: UserTeamStatus.PENDING,
      },
    });
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    await this.prisma.userTeam.delete({
      where: {
        userId_teamId: { userId, teamId },
      },
    });
  }

  async updateMemberStatus(
    teamId: string,
    userId: string,
    status: UserTeamStatus,
  ): Promise<UserTeam> {
    return this.prisma.userTeam.update({
      where: {
        userId_teamId: { userId, teamId },
      },
      data: { status },
    });
  }
}
