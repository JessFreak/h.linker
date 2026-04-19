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

  async findConnection(teamId: string, userId: string): Promise<UserTeam> {
    return this.prisma.userTeam.findUnique({
      where: { userId_teamId: { userId, teamId } },
    });
  }

  async upsertConnection(
    data: Prisma.UserTeamUncheckedCreateInput,
  ): Promise<UserTeam> {
    return this.prisma.userTeam.upsert({
      where: {
        userId_teamId: { userId: data.userId, teamId: data.teamId },
      },
      update: {
        status: data.status,
        roleName: data.roleName,
        message: data.message,
        type: data.type,
        created: new Date(),
      },
      create: data,
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
