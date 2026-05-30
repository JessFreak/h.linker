import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, User, UserTeamStatus } from '@prisma/client';
import { FullUser, UserWithSkills } from '../entities/user.entity';
import { BaseQueryDTO, PageMetaResponse, PageResponse } from '@h.linker/libs';
import { Paginator } from '../../utils/prisma-pagination.util';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}
  private readonly include = {
    skills: true,
  } satisfies Prisma.UserInclude;
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

  async checkExistsByUsername(username: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    return !!user;
  }

  async checkExistsById(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findAllPaged(
    query: BaseQueryDTO,
    where?: Prisma.UserWhereInput,
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ): Promise<PageResponse<UserWithSkills>> {
    return Paginator.paginate<UserWithSkills>(
      ({ skip, take }) =>
        this.prisma.user.findMany({
          where,
          orderBy,
          include: { skills: true },
          skip,
          take,
        }),
      () => this.prisma.user.count({ where }),
      query,
    );
  }

  async findRecommendedPaged(
    query: BaseQueryDTO,
    where: Prisma.UserWhereInput,
    currentUserSkills: string[],
  ): Promise<PageResponse<UserWithSkills & { matchPercentage?: number }>> {
    const page = query.page ?? 1;
    const take = query.take ?? 12;
    const skip = (page - 1) * take;

    const lightweightUsers = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        skills: { select: { category: true } },
      },
    });

    const totalTargetSkills = currentUserSkills.length;

    const calculated = lightweightUsers.map((u) => {
      const matchingSkills = u.skills.filter((s) =>
        currentUserSkills.includes(s.category),
      ).length;

      const matchPercentage =
        totalTargetSkills > 0 ? (matchingSkills / totalTargetSkills) * 100 : 0;

      return { id: u.id, matchPercentage };
    });

    calculated.sort((a, b) => b.matchPercentage - a.matchPercentage);

    const paginatedIds = calculated.slice(skip, skip + take).map((c) => c.id);
    const rawData = await this.prisma.user.findMany({
      where: { id: { in: paginatedIds } },
      include: this.include,
    });

    const sortedData = paginatedIds
      .map((id) => {
        const user = rawData.find((d) => d.id === id);
        if (!user) return null;
        const calcInfo = calculated.find((c) => c.id === id);
        return { ...user, matchPercentage: calcInfo?.matchPercentage };
      })
      .filter((d): d is NonNullable<typeof d> => d !== null);

    const meta = new PageMetaResponse({
      page,
      take,
      itemCount: lightweightUsers.length,
    });
    return new PageResponse(sortedData, meta);
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
