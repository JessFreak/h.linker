import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, UserTeamStatus, UserTeamType } from '@prisma/client';
import { TeamWithMembers } from '../entities/team.entity';

@Injectable()
export class TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  private getInclude(statuses: UserTeamStatus[] = ['ACCEPTED']) {
    return {
      members: {
        where: {
          status: { in: statuses },
        },
        include: {
          user: true,
        },
      },
      participations: {
        include: {
          hackathon: true,
        },
      },
    };
  }

  async create(
    data: Prisma.TeamUncheckedCreateInput,
  ): Promise<TeamWithMembers> {
    return this.prisma.team.create({
      data: {
        name: data.name,
        description: data.description,
        communicationLink: data.communicationLink,
        leaderId: data.leaderId,
        members: {
          create: {
            userId: data.leaderId,
            roleName: 'Team Lead',
            type: UserTeamType.REQUEST,
            status: UserTeamStatus.ACCEPTED,
          },
        },
      },
      include: this.getInclude(),
    });
  }

  async find(where: Prisma.TeamWhereInput): Promise<TeamWithMembers[]> {
    return this.prisma.team.findMany({
      where,
      include: this.getInclude(),
    });
  }

  async findById(id: string): Promise<TeamWithMembers> {
    return this.prisma.team.findFirst({
      where: { id },
      include: this.getInclude(['ACCEPTED', 'PENDING']),
    });
  }

  async updateById(
    id: string,

    data: Prisma.TeamUncheckedUpdateInput,
  ): Promise<TeamWithMembers> {
    return this.prisma.team.update({
      where: { id },
      data,
      include: this.getInclude(['ACCEPTED', 'PENDING']),
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.team.delete({ where: { id } });
  }
}
