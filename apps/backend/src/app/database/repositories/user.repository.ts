import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, UserTeamStatus } from '@prisma/client';
import { FullUser, UserWithSkills } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly FULL_USER_INCLUDE = {
    skills: true,
    createdHackathons: true,
    memberships: {
      where: {
        status: UserTeamStatus.ACCEPTED,
      },
      include: {
        team: {
          include: {
            participations: {
              include: {
                hackathon: true,
              },
            },
          },
        },
      },
    },
  };

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async find(where: Prisma.UserWhereInput): Promise<UserWithSkills[]> {
    return this.prisma.user.findMany({ where, include: { skills: true } });
  }

  async findById(id: string): Promise<UserWithSkills> {
    return this.prisma.user.findFirst({
      where: { id },
      include: { skills: true },
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { email } });
  }

  async findByUsername(
    username: string,
    full = false,
  ): Promise<FullUser | User> {
    return this.prisma.user.findFirst({
      where: { username },
      include: full ? this.FULL_USER_INCLUDE : undefined,
    }) as Promise<FullUser | User>;
  }

  async findByGithubId(githubId: string): Promise<User> {
    return this.prisma.user.findFirst({ where: { githubId } });
  }

  async findMany(where: Prisma.UserWhereInput): Promise<User[]> {
    return this.prisma.user.findMany({ where });
  }

  async updateById(
    id: string,
    data: Prisma.UserUncheckedUpdateInput,
  ): Promise<UserWithSkills> {
    return this.prisma.user.update({
      where: { id },
      data,
      include: { skills: true },
    });
  }

  async deleteById(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
