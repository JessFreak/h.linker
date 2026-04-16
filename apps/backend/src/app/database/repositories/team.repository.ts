import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, UserTeamStatus, UserTeamType } from '@prisma/client';
import { TeamWithMembers } from '../entities/team.entity';

@Injectable()
export class TeamRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly include = {
    members: {
      where: {
        status: UserTeamStatus.ACCEPTED,
      },
      include: {
        user: true,
      },
    },
  };

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
      include: this.include,
    });
  }

  async find(where: Prisma.TeamWhereInput): Promise<TeamWithMembers[]> {
    return this.prisma.team.findMany({ where, include: this.include });
  }

  async findById(id: string): Promise<TeamWithMembers> {
    return this.prisma.team.findFirst({ where: { id }, include: this.include });
  }

  async updateById(
    id: string,

    data: Prisma.TeamUncheckedUpdateInput,
  ): Promise<TeamWithMembers> {
    return this.prisma.team.update({
      where: { id },
      data,
      include: this.include,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.team.delete({ where: { id } });
  }
}
